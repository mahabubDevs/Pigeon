import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IPigeon } from "./pigeon.interface";
import { Pigeon } from "./pigeon.model";
import mongoose from "mongoose";

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
const getAllPigeonsFromDB = async (): Promise<IPigeon[]> => {
  const result = await Pigeon.find({ status: { $ne: "Deleted" } }).populate("user").populate("father").populate("mother");
  return result;
};

/**
 * Get Single Pigeon Details
 */
const getPigeonDetailsFromDB = async (id: string): Promise<IPigeon | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID");
  }

  const result = await Pigeon.findById(id).populate("user").populate("father").populate("mother");

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

export const PigeonService = {
  createPigeonToDB,
  updatePigeonToDB,
  getAllPigeonsFromDB,
  getPigeonDetailsFromDB,
  deletePigeonFromDB,
};
