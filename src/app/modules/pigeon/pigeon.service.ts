import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IPigeon } from "./pigeon.interface";
import { Pigeon } from "./pigeon.model";
import mongoose from "mongoose";
// import    from "../../../helpers/pdfHelper";
import XLSX from 'xlsx';
import QueryBuilder from "../../../util/queryBuilder";
import pdfDoc from "../../../helpers/pdfHelper";

/**
 * Create Pigeon in DB
 */




const createPigeonToDB = async (data: any, files: any, user: any): Promise<IPigeon> => {
  if (!data) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Data field is required");
  }
  if (!user || !user._id) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated");
  }


 // Free user validation
  if (user.role === 'USER') {
    const pigeonCount = await Pigeon.countDocuments({ user: user._id });
    if (pigeonCount >= 50) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Free users can only add up to 50 pigeons");
    }
  }

  // Step 1: Parse JSON
  let parsedData: any;
  try {
    parsedData = JSON.parse(data);
  } catch (err) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Data must be valid JSON");
  }


   // Step 2: Validate father/mother ring IDs
  if (parsedData.fatherRingId) {
    const father = await Pigeon.findOne({ ringNumber: parsedData.fatherRingId });
    if (!father) throw new ApiError(StatusCodes.BAD_REQUEST, "Father pigeon not found in DB");
  }

  if (parsedData.motherRingId) {
    const mother = await Pigeon.findOne({ ringNumber: parsedData.motherRingId });
    if (!mother) throw new ApiError(StatusCodes.BAD_REQUEST, "Mother pigeon not found in DB");
  }



// --- ADD THIS BEFORE MERGE PAYLOAD ---

if (parsedData.fatherRingId) {
  const father = await Pigeon.findOne({ ringNumber: parsedData.fatherRingId });
  if (!father) throw new ApiError(StatusCodes.BAD_REQUEST, "Father pigeon not found");
  parsedData.fatherRingId = father._id; // ObjectId হিসেবে set
}

if (parsedData.motherRingId) {
  const mother = await Pigeon.findOne({ ringNumber: parsedData.motherRingId });
  if (!mother) throw new ApiError(StatusCodes.BAD_REQUEST, "Mother pigeon not found");
  parsedData.motherRingId = mother._id; // ObjectId হিসেবে set
}




  // Step 2: Handle files
  const photos: string[] = [];
  if (files) {
    const filesArray: Express.Multer.File[] = Object.values(files).flat() as Express.Multer.File[];
    filesArray.forEach(file => {
      photos.push(file.path.replace(/\\/g, '/'));
    });
  }

  // Step 3: Merge payload
  const payload: IPigeon = {
    ...parsedData,
    photos,
    user: user._id
  };

  // Step 4: Save DB
  const result = await Pigeon.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create pigeon");
  }

  return result;
};


/**
 * Update Pigeon in DB
 */

const updatePigeonToDB = async (
  pigeonId: string,
  data: any,
  files: any,
  deletedIndexes: number[]
): Promise<IPigeon> => {
  const pigeon = await Pigeon.findById(pigeonId);
  if (!pigeon) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Pigeon not found");
  }

  // Step 1: Parse JSON data
  let parsedData: any = {};
  if (data) {
    try {
      parsedData = JSON.parse(data);
    } catch {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid JSON data");
    }
  }

  // Step 2: Remove images according to deletedIndexes
  let currentPhotos = pigeon.photos || [];
  if (deletedIndexes.length > 0) {
    currentPhotos = currentPhotos.filter((_, idx) => !deletedIndexes.includes(idx));
  }

  // Step 3: Add new uploaded files
  if (files) {
    const filesArray: Express.Multer.File[] = Object.values(files).flat() as Express.Multer.File[];
    const newPhotos = filesArray.map(file => file.path.replace(/\\/g, '/'));
    currentPhotos = currentPhotos.concat(newPhotos);
  }

  // Step 4: Merge payload
  const payload: Partial<IPigeon> = {
    ...parsedData,
    photos: currentPhotos
  };

  // Step 5: Update DB
  const updatedPigeon = await Pigeon.findByIdAndUpdate(pigeonId, payload, { new: true });
  return updatedPigeon!;
};

/**
 * Get All Pigeons
 */
/**
 * Get all pigeons with pagination, filter, and sort
 *  @param query- req.query object from request
 */

const getAllPigeonsFromDB = async (query: any): Promise<{ data: IPigeon[]; pagination: any }> => {
  let baseQuery = Pigeon.find({ status: { $ne: 'Deleted' } });

  const qb = new QueryBuilder<IPigeon>(baseQuery, query);

  qb.search(['ringNumber', 'name', 'country', 'breeder'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .populate(['user', 'fatherRingId', 'motherRingId'], {
      user: 'name email',
      fatherRingId: 'ringNumber name',
      motherRingId: 'ringNumber name',
    });

  // Execute query
  const dataRaw = await qb.modelQuery.lean();

  // Safe type assertion through unknown
  const data: IPigeon[] = dataRaw as unknown as IPigeon[];

  const pagination = await qb.getPaginationInfo();

  return { data, pagination };
};





/**
 * Get Single Pigeon Details
 */
const getPigeonDetailsFromDB = async (id: string): Promise<IPigeon | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID");
  }

  const result = await Pigeon.findById(id).populate("user").populate("fatherRingId").populate("motherRingId");

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Pigeon not found");
  }

  return result;
};

/**
 * Delete Pigeon (soft delete: set status = "Deleted")
 */
const deletePigeonFromDB = async (id: string): Promise<IPigeon | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID");
  }

  const result = await Pigeon.findByIdAndUpdate(
    { _id: id },
    { status: "Deleted" },
    { new: true }
  );

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete Pigeon");
  }

  return result;
};


const getPigeonWithFamily = async (pigeonId: string, maxDepth = 5) => {

  // Recursive function to populate family
  const populateFamily = async (pigeon: any, depth = 0): Promise<any> => {
    if (!pigeon || depth >= maxDepth) return pigeon;

    const populatedPigeonRaw = await Pigeon.findById(pigeon._id)
      .populate('fatherRingId')
      .populate('motherRingId')
      .lean();

    if (!populatedPigeonRaw) return null;

    const populatedPigeon = populatedPigeonRaw;

    if (populatedPigeon.fatherRingId) {
      populatedPigeon.fatherRingId = await populateFamily(populatedPigeon.fatherRingId, depth + 1);
    }
    if (populatedPigeon.motherRingId) {
      populatedPigeon.motherRingId = await populateFamily(populatedPigeon.motherRingId, depth + 1);
    }

    return populatedPigeon;
  };

  const pigeon = await Pigeon.findById(pigeonId);
  if (!pigeon) throw new ApiError(StatusCodes.NOT_FOUND, 'Pigeon not found');

  const fullFamily = await populateFamily(pigeon);
  return fullFamily;
};

const getSiblings = async (pigeonId: string) => {
  // Step 1: Find the pigeon
  const pigeon = await Pigeon.findById(pigeonId);
  if (!pigeon) throw new ApiError(StatusCodes.NOT_FOUND, 'Pigeon not found');

  const fatherId = pigeon.fatherRingId;
  const motherId = pigeon.motherRingId;

  // Step 2: Full siblings (same father & same mother)
  const fullSiblings = await Pigeon.find({
    _id: { $ne: pigeon._id },
    fatherRingId: fatherId,
    motherRingId: motherId
  }).lean();

  // Step 3: Half-siblings (same father OR same mother, but not both)
  const halfSiblings = await Pigeon.find({
    _id: { $ne: pigeon._id },
    $or: [
      { fatherRingId: fatherId, motherRingId: { $ne: motherId } },
      { motherRingId: motherId, fatherRingId: { $ne: fatherId } }
    ]
  }).lean();

  return {
    pigeon,
    fullSiblings,
    halfSiblings
  };
};


const importFromExcel = async (filePath: string, user: any) => {
  // Free user check
  if (user.role === 'USER') {
    const currentCount = await Pigeon.countDocuments({ user: user._id });
    if (currentCount >= 50) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Free users can only add up to 50 pigeons");
    }
  }

  // Read Excel
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const pigeonsToInsert: any[] = [];

  for (const row of rows) {
    const {
      ringNumber,
      name,
      country,
      birthYear,
      shortInfo,
      breeder,
      color,
      pattern,
      racherRating,
      breederRating,
      gender,
      status,
      location,
      racingRating,
      notes,
      results,
      fatherRingId,
      motherRingId,
      photos
    }: any = row;

    if (!ringNumber) continue; // skip empty

    const pigeonData: any = {
      ringNumber,
      name,
      country,
      birthYear,
      shortInfo,
      breeder,
      color,
      pattern,
      racherRating,
      breederRating,
      gender,
      status,
      location,
      racingRating,
      notes,
      results
    };

    // Validate father/mother
    if (fatherRingId) {
      const father = await Pigeon.findOne({ ringNumber: fatherRingId });
      if (!father) throw new ApiError(StatusCodes.BAD_REQUEST, `Father ${fatherRingId} not found`);
      pigeonData.fatherRingId = father._id;
    }
    if (motherRingId) {
      const mother = await Pigeon.findOne({ ringNumber: motherRingId });
      if (!mother) throw new ApiError(StatusCodes.BAD_REQUEST, `Mother ${motherRingId} not found`);
      pigeonData.motherRingId = mother._id;
    }

    // Parse photos (comma or semicolon separated)
    if (photos && typeof photos === "string") {
      pigeonData.photos = photos.split(/[,;]+/).map((p: string) => p.trim()).filter(Boolean);
    } else {
      pigeonData.photos = [];
    }

    // Attach user
    pigeonData.user = user._id;

    pigeonsToInsert.push(pigeonData);
  }

  // Insert into DB
  const inserted = await Pigeon.insertMany(pigeonsToInsert);
  return inserted;
};


// function isValidObjectId(id: string) {
//   return mongoose.Types.ObjectId.isValid(id);
// }

const exportToPDF = async (query: any): Promise<Buffer> => {
  // Step 1: Base query (Deleted pigeons skip)
  let baseQuery = Pigeon.find({ status: { $ne: "Deleted" } });

  // Step 2: Apply search, filter, sort, pagination
  const qb = new QueryBuilder<IPigeon>(baseQuery, query);
  qb.search(['ringNumber', 'name', 'country', 'breeder'])
    .filter()
    .sort()
    .paginate() // page & limit support
    .fields()
    .populate(['user', 'fatherRingId', 'motherRingId'], {
      user: 'name email',
      fatherRingId: 'ringNumber name',
      motherRingId: 'ringNumber name',
    });

  // Step 3: Execute query (plain objects)
  const pigeonsRaw = await qb.modelQuery.lean();
  const pigeons: IPigeon[] = pigeonsRaw as unknown as IPigeon[];

  if (!pigeons.length) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No pigeons found for this filter/page");
  }

  // Step 4: Generate PDF
  const pdfBuffer = await pdfDoc(pigeons); // pdfDoc helper ব্যবহার হবে
  return pdfBuffer;
};






export const PigeonService = {
  createPigeonToDB,
  updatePigeonToDB,
  getAllPigeonsFromDB,
  getPigeonDetailsFromDB,
  deletePigeonFromDB,
  getPigeonWithFamily,
  getSiblings,
  importFromExcel,
  exportToPDF
};
