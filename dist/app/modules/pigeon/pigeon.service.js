"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PigeonService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const pigeon_model_1 = require("./pigeon.model");
const mongoose_1 = __importDefault(require("mongoose"));
// import    from "../../../helpers/pdfHelper";
const xlsx_1 = __importDefault(require("xlsx"));
const queryBuilder_1 = __importDefault(require("../../../util/queryBuilder"));
const pdfHelper_1 = __importDefault(require("../../../helpers/pdfHelper"));
const notification_service_1 = require("../notification/notification.service");
const user_model_1 = require("../user/user.model");
// Create Pigeon in DB
const createPigeonToDB = (data, files, user) => __awaiter(void 0, void 0, void 0, function* () {
    if (!data)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Data field is required");
    if (!(user === null || user === void 0 ? void 0 : user._id))
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    // Free user validation
    if (user.role === "USER") {
        const pigeonCount = yield pigeon_model_1.Pigeon.countDocuments({ user: user._id });
        if (pigeonCount >= 50)
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "Free users can only add up to 50 pigeons");
    }
    const parsedData = Object.assign({}, data);
    // Numeric conversion
    ["birthYear", "racerRating", "breederRating", "racingRating"].forEach(field => {
        if (parsedData[field] !== undefined) {
            parsedData[field] = Number(parsedData[field]);
        }
    });
    // Free user restrictions
    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
        parsedData.verified = false;
        parsedData.iconic = false;
        parsedData.iconicScore = 0;
    }
    // Father/Mother Ring
    if (parsedData.fatherRingId && parsedData.fatherRingId.trim() !== "") {
        const father = yield pigeon_model_1.Pigeon.findOne({ ringNumber: parsedData.fatherRingId });
        if (!father)
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Father pigeon not found");
        parsedData.fatherRingId = father._id;
    }
    else {
        parsedData.fatherRingId = null;
    }
    if (parsedData.motherRingId && parsedData.motherRingId.trim() !== "") {
        const mother = yield pigeon_model_1.Pigeon.findOne({ ringNumber: parsedData.motherRingId });
        if (!mother)
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Mother pigeon not found");
        parsedData.motherRingId = mother._id;
    }
    else {
        parsedData.motherRingId = null;
    }
    // Handle photos
    const photos = [];
    if (files && Object.keys(files).length > 0) {
        const filesArray = Object.values(files).flat();
        filesArray.forEach(file => photos.push(`/images/${file.filename}`));
    }
    parsedData.photos = photos;
    // Handle optional results array
    if (!parsedData.results) {
        parsedData.results = []; // empty array if not provided
    }
    else if (typeof parsedData.results === "string") {
        try {
            parsedData.results = JSON.parse(parsedData.results);
            if (!Array.isArray(parsedData.results))
                parsedData.results = [];
        }
        catch (_a) {
            parsedData.results = [];
        }
    }
    else if (!Array.isArray(parsedData.results)) {
        parsedData.results = [];
    }
    // Save to DB
    const payload = Object.assign(Object.assign({}, parsedData), { user: user._id });
    const result = yield pigeon_model_1.Pigeon.create(payload);
    if (!result)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to create pigeon");
    // Fetch sender from DB
    const sender = yield user_model_1.User.findById(user._id).select("name");
    console.log(sender, "sender ");
    // Notification
    yield notification_service_1.NotificationService.createNotificationToDB({
        text: `New pigeon added by ${(sender === null || sender === void 0 ? void 0 : sender.name) || "Unknown User"}`, // ✅ use sender.name
        type: "ADMIN",
        referenceId: result._id.toString(),
        read: false,
    });
    return result;
});
const updatePigeonToDB = (pigeonId, data, files, user) => __awaiter(void 0, void 0, void 0, function* () {
    if (!pigeonId)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Pigeon ID is required");
    if (!data)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Data field is required");
    // Fetch existing pigeon
    const pigeon = yield pigeon_model_1.Pigeon.findById(pigeonId);
    if (!pigeon)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Pigeon not found");
    // Parse JSON string if needed
    let parsedData = data;
    if (typeof data === "string") {
        try {
            parsedData = JSON.parse(data);
        }
        catch (err) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid JSON data");
        }
    }
    // Admin/SuperAdmin check for special fields
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        delete parsedData.verified;
        delete parsedData.iconic;
        delete parsedData.iconicScore;
    }
    // Convert numeric fields
    ["birthYear", "racerRating", "breederRating", "racingRating"].forEach(field => {
        if (parsedData[field] !== undefined)
            parsedData[field] = Number(parsedData[field]);
    });
    // Update fatherRingId
    if (parsedData.fatherRingId && parsedData.fatherRingId.trim() !== "") {
        const father = yield pigeon_model_1.Pigeon.findOne({ ringNumber: parsedData.fatherRingId });
        if (!father)
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Father pigeon not found");
        parsedData.fatherRingId = father._id;
    }
    else {
        parsedData.fatherRingId = null; // allow clearing
    }
    // Update motherRingId
    if (parsedData.motherRingId && parsedData.motherRingId.trim() !== "") {
        const mother = yield pigeon_model_1.Pigeon.findOne({ ringNumber: parsedData.motherRingId });
        if (!mother)
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Mother pigeon not found");
        parsedData.motherRingId = mother._id;
    }
    else {
        parsedData.motherRingId = null; // allow clearing
    }
    // --- Handle photos ---
    let currentPhotos = pigeon.photos || []; // DB-তে পুরানো ছবি
    let newPhotos = [];
    let remainingPhotos = parsedData.remaining || [];
    // যদি নতুন ফাইল থাকে
    if (files && Object.keys(files).length > 0) {
        const filesArray = Object.values(files).flat();
        newPhotos = filesArray.map(file => `/images/${file.filename}`);
    }
    // আগেরগুলো থেকে শুধুমাত্র remaining গুলো রেখে দিচ্ছি
    let updatedPhotos = currentPhotos.filter(photo => remainingPhotos.includes(photo));
    // নতুন ছবি যোগ করছি
    updatedPhotos.push(...newPhotos);
    // Duplicate remove
    updatedPhotos = Array.from(new Set(updatedPhotos));
    // At least one image থাকতে হবে
    if (updatedPhotos.length === 0) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "At least one image is required");
    }
    parsedData.photos = updatedPhotos;
    // Merge payload with existing pigeon data
    const payload = Object.assign(Object.assign({}, pigeon.toObject()), parsedData);
    // Update DB
    const updatedPigeon = yield pigeon_model_1.Pigeon.findByIdAndUpdate(pigeonId, payload, {
        new: true,
    });
    if (!updatedPigeon)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to update pigeon");
    // Notification
    yield notification_service_1.NotificationService.createNotificationToDB({
        text: `Pigeon updated by ${user.name}`,
        type: "ADMIN",
        referenceId: pigeon._id.toString(),
        read: false,
    });
    return updatedPigeon;
});
// Get All Pigeons
const getAllPigeonsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    let baseQuery = pigeon_model_1.Pigeon.find({ status: { $ne: "Deleted" } });
    const qb = new queryBuilder_1.default(baseQuery, query);
    qb.search(["ringNumber", "name", "country",])
        .filter();
    // Step 3: Explicit status filter
    if (query.status) {
        qb.modelQuery = qb.modelQuery.where({
            status: new RegExp(`^${query.status}$`, "i") // case-insensitive exact match
        });
    }
    qb.sort()
        .paginate()
        .fields()
        .populate(["user", "fatherRingId", "motherRingId", "breeder"], {
        user: "name email",
        fatherRingId: "ringNumber name",
        motherRingId: "ringNumber name",
        breeder: "breederName"
    });
    // Execute query
    const dataRaw = yield qb.modelQuery.lean();
    // Safe type assertion through unknown
    const data = dataRaw;
    const pagination = yield qb.getPaginationInfo();
    return { pagination, data };
});
// const getAllPigeonsFromDB = async (
//   query: any
// ): Promise<{ data: IPigeon[]; pagination: any }> => {
//   let baseQuery = Pigeon.find({ status: { $ne: "Deleted" } });
//   const qb = new QueryBuilder<IPigeon>(baseQuery, query);
//   qb.search(["ringNumber", "name", "country", "breeder"])
//     .filter();
//   // Explicit status filter
//   if (query.status) {
//     qb.modelQuery = qb.modelQuery.where({
//       status: new RegExp(`^${query.status}$`, "i") // case-insensitive exact match
//     });
//   }
//   qb.sort()
//     .paginate()
//     .fields()
//     .populate([
//       "user",
//       "fatherRingId",
//       "motherRingId",
//       "breeder" // <-- breeder add করা হলো
//     ], {
//       user: "name email",
//       fatherRingId: "ringNumber name",
//       motherRingId: "ringNumber name",
//       breeder: "name" // <-- breeder থেকে শুধু name দেখাবে
//     });
//   // Execute query
//   const dataRaw = await qb.modelQuery.lean();
//   // Safe type assertion
//   const data: IPigeon[] = dataRaw as unknown as IPigeon[];
//   const pagination = await qb.getPaginationInfo();
//   return { pagination, data };
// };
// Get Single Pigeon Details
const getPigeonDetailsFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid ID");
    }
    const result = yield pigeon_model_1.Pigeon.findById(id)
        .populate("user")
        .populate("fatherRingId")
        .populate("motherRingId")
        .populate("breeder");
    if (!result) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Pigeon not found");
    }
    return result;
});
const getMyAllPigeonDetailsFromDB = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    // Step 1: Base query (only this user's pigeons, skip Deleted)
    let baseQuery = pigeon_model_1.Pigeon.find({ user: userId, status: { $ne: "Deleted" } });
    const qb = new queryBuilder_1.default(baseQuery, query);
    // Step 2: Search only on these fields (exclude status from search)
    qb.search(["ringNumber", "name", "country",])
        .filter(); // other filters except status
    // Step 3: Explicit status filter
    if (query.status) {
        qb.modelQuery = qb.modelQuery.where({
            status: new RegExp(`^${query.status}$`, "i") // case-insensitive exact match
        });
    }
    // Step 4: Sort, paginate, fields, populate
    qb.sort()
        .paginate()
        .fields()
        .populate(["user", "fatherRingId", "motherRingId", "breeder"], {
        user: "name email",
        fatherRingId: "ringNumber name",
        motherRingId: "ringNumber name",
        breeder: "breederName"
    });
    // Execute query
    const dataRaw = yield qb.modelQuery.lean();
    const data = dataRaw;
    const pagination = yield qb.getPaginationInfo();
    // Always return empty array if no data
    return { pagination, data };
});
// Delete Pigeon (soft delete: set status = "Deleted")
const deletePigeonFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid ID");
    }
    // Soft delete: set status to "Deleted"
    // const result = await Pigeon.findByIdAndUpdate(
    //   { _id: id },
    //   { status: "Deleted" },
    //   { new: true }
    // );
    const result = yield pigeon_model_1.Pigeon.findOneAndDelete({ _id: id });
    if (!result) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to delete Pigeon");
    }
    return result;
});
// Get Pigeon with family members (parents) up to a certain depth
const getPigeonWithFamily = (pigeonId_1, ...args_1) => __awaiter(void 0, [pigeonId_1, ...args_1], void 0, function* (pigeonId, maxDepth = 5) {
    const populateFamily = (pigeon_1, ...args_2) => __awaiter(void 0, [pigeon_1, ...args_2], void 0, function* (pigeon, depth = 0) {
        if (!pigeon)
            return pigeon;
        // Always populate current pigeon
        const populatedPigeonRaw = yield pigeon_model_1.Pigeon.findById(pigeon._id)
            .populate(["fatherRingId", "motherRingId", "breeder"])
            .lean();
        if (!populatedPigeonRaw)
            return null;
        const populatedPigeon = populatedPigeonRaw;
        // Recurse only if depth < maxDepth
        if (depth < maxDepth) {
            if (populatedPigeon.fatherRingId) {
                populatedPigeon.fatherRingId = yield populateFamily(populatedPigeon.fatherRingId, depth + 1);
            }
            if (populatedPigeon.motherRingId) {
                populatedPigeon.motherRingId = yield populateFamily(populatedPigeon.motherRingId, depth + 1);
            }
        }
        return populatedPigeon;
    });
    const pigeon = yield pigeon_model_1.Pigeon.findById(pigeonId);
    if (!pigeon)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Pigeon not found");
    const fullFamily = yield populateFamily(pigeon);
    return fullFamily;
});
// const getPigeonWithFamily = async (pigeonId: string, maxDepth = 5) => {
//   const allPigeons = await Pigeon.find({})
//     .select("")
//     .lean();
//   const pigeonMap = new Map<string, any>();
//   allPigeons.forEach((p) => pigeonMap.set(p._id.toString(), p));
//   const buildFamily = (pigeon: any, depth = 0): any => {
//     if (!pigeon || depth >= maxDepth) return pigeon;
//     const father = pigeon.fatherRingId
//       ? buildFamily(pigeonMap.get(pigeon.fatherRingId.toString()), depth + 1)
//       : null;
//     const mother = pigeon.motherRingId
//       ? buildFamily(pigeonMap.get(pigeon.motherRingId.toString()), depth + 1)
//       : null;
//     return { ...pigeon, fatherRingId: father, motherRingId: mother };
//   };
//   const basePigeon = pigeonMap.get(pigeonId);
//   return buildFamily(basePigeon);
// };
// const getSiblings = async (pigeonId: string) => {
//   // Step 1: Find the pigeon
//   const pigeon = await Pigeon.findById(pigeonId);
//   if (!pigeon) throw new ApiError(StatusCodes.NOT_FOUND, "Pigeon not found");
//   const fatherId = pigeon.fatherRingId;
//   const motherId = pigeon.motherRingId;
//   // Step 2: Full siblings (same father & same mother)
//   const fullSiblings = await Pigeon.find({
//     _id: { $ne: pigeon._id },
//     fatherRingId: fatherId,
//     motherRingId: motherId,
//   }).sort({ createdAt: -1 }) // latest first
//     .limit(5)
//     .lean();
//   // Step 3: Half-siblings (same father OR same mother, but not both)
//   const halfSiblings = await Pigeon.find({
//     _id: { $ne: pigeon._id },
//     $or: [
//       { fatherRingId: fatherId, motherRingId: { $ne: motherId } },
//       { motherRingId: motherId, fatherRingId: { $ne: fatherId } },
//     ],
//   }).sort({ createdAt: -1 }) // latest first
//     .limit(5)
//     .lean();
//   return {
//     pigeon,
//     fullSiblings,
//     halfSiblings,
//   };
// };
const getSiblings = (pigeonId) => __awaiter(void 0, void 0, void 0, function* () {
    // Step 1: Find the pigeon
    const pigeon = yield pigeon_model_1.Pigeon.findById(pigeonId).lean();
    if (!pigeon)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Pigeon not found");
    const fatherId = pigeon.fatherRingId;
    const motherId = pigeon.motherRingId;
    // Step 2: Full siblings (same father & same mother)
    const fullSiblings = yield pigeon_model_1.Pigeon.find({
        _id: { $ne: pigeon._id },
        fatherRingId: fatherId,
        motherRingId: motherId,
    })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    // Step 3: Half-siblings (same father OR same mother, but not both)
    const halfSiblings = yield pigeon_model_1.Pigeon.find({
        _id: { $ne: pigeon._id },
        $or: [
            { fatherRingId: fatherId, motherRingId: { $ne: motherId } },
            { motherRingId: motherId, fatherRingId: { $ne: fatherId } },
        ],
    })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    // Step 4: Map type to each sibling
    const siblings = [
        ...fullSiblings.map((s) => (Object.assign(Object.assign({}, s), { type: "fullSibling" }))),
        ...halfSiblings.map((s) => (Object.assign(Object.assign({}, s), { type: "halfSibling" }))),
    ];
    return siblings;
});
// Import pigeons from Excel file
const importFromExcel = (filePath, user) => __awaiter(void 0, void 0, void 0, function* () {
    // Free user check
    if (user.role === "USER") {
        const currentCount = yield pigeon_model_1.Pigeon.countDocuments({ user: user._id });
        if (currentCount >= 50) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "Free users can only add up to 50 pigeons");
        }
    }
    // Read Excel
    const workbook = xlsx_1.default.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const pigeonsToInsert = [];
    for (const row of rows) {
        const { ringNumber, name, country, birthYear, shortInfo, breeder, color, pattern, racherRating, breederRating, gender, status, location, racingRating, notes, results, fatherRingId, motherRingId, photos, } = row;
        if (!ringNumber)
            continue; // skip empty
        const pigeonData = {
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
        };
        // Validate father/mother
        if (fatherRingId) {
            const father = yield pigeon_model_1.Pigeon.findOne({ ringNumber: fatherRingId });
            if (!father)
                throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Father ${fatherRingId} not found`);
            pigeonData.fatherRingId = father._id;
        }
        if (motherRingId) {
            const mother = yield pigeon_model_1.Pigeon.findOne({ ringNumber: motherRingId });
            if (!mother)
                throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Mother ${motherRingId} not found`);
            pigeonData.motherRingId = mother._id;
        }
        // Parse photos (comma or semicolon separated)
        if (photos && typeof photos === "string") {
            pigeonData.photos = photos
                .split(/[,;]+/)
                .map((p) => p.trim())
                .filter(Boolean);
        }
        else {
            pigeonData.photos = [];
        }
        // Attach user
        pigeonData.user = user._id;
        pigeonsToInsert.push(pigeonData);
    }
    // Insert into DB
    const inserted = yield pigeon_model_1.Pigeon.insertMany(pigeonsToInsert);
    return inserted;
});
// Export pigeons to PDF
const exportToPDF = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // Step 1: Base query (Deleted pigeons skip)
    let baseQuery = pigeon_model_1.Pigeon.find({ status: { $ne: "Deleted" } });
    // Step 2: Apply search, filter, sort, pagination
    const qb = new queryBuilder_1.default(baseQuery, query);
    qb.search(["ringNumber", "name", "country",])
        .filter()
        .sort()
        .paginate() // page & limit support
        .fields()
        .populate(["user", "fatherRingId", "motherRingId"], {
        user: "name email",
        fatherRingId: "ringNumber name",
        motherRingId: "ringNumber name",
    });
    // Step 3: Execute query (plain objects)
    const pigeonsRaw = yield qb.modelQuery.lean();
    const pigeons = pigeonsRaw;
    if (!pigeons.length) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "No pigeons found for this filter/page");
    }
    // Step 4: Generate PDF
    const pdfBuffer = yield (0, pdfHelper_1.default)(pigeons); // pdfDoc helper
    return pdfBuffer;
});
// Get My Pigeons with filter/pagination
const getMyPigeonsFromDB = (user, query) => __awaiter(void 0, void 0, void 0, function* () {
    if (!user || !user._id) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    // Step 1: Base query (only this user's pigeons, Deleted skip)
    let baseQuery = pigeon_model_1.Pigeon.find({
        user: user._id,
        status: { $ne: "Deleted" },
    });
    const qb = new queryBuilder_1.default(baseQuery, query);
    qb.search(["ringNumber", "name", "country",])
        .filter()
        .sort()
        .paginate()
        .fields()
        .populate(["fatherRingId", "motherRingId", "breeder"], {});
    const dataRaw = yield qb.modelQuery.lean();
    const data = dataRaw;
    const pagination = yield qb.getPaginationInfo();
    return { data, pagination };
});
const searchPigeonsByNameFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const pigeons = yield pigeon_model_1.Pigeon.find({
        $and: [
            { status: { $ne: "Deleted" } },
            {
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { ringNumber: { $regex: query, $options: "i" } }
                ]
            }
        ]
    }).select("_id name ringNumber");
    return pigeons;
});
const togglePigeonStatusInDB = (pigeonId) => __awaiter(void 0, void 0, void 0, function* () {
    const pigeon = yield pigeon_model_1.Pigeon.findById(pigeonId);
    if (!pigeon)
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Pigeon not found");
    // Toggle status
    pigeon.status = pigeon.status === "active" ? "inactive" : "active";
    yield pigeon.save();
    return {
        id: pigeon._id.toString(),
        status: pigeon.status,
    };
});
exports.PigeonService = {
    createPigeonToDB,
    updatePigeonToDB,
    getAllPigeonsFromDB,
    getPigeonDetailsFromDB,
    deletePigeonFromDB,
    getPigeonWithFamily,
    getSiblings,
    importFromExcel,
    exportToPDF,
    getMyPigeonsFromDB,
    searchPigeonsByNameFromDB,
    getMyAllPigeonDetailsFromDB,
    togglePigeonStatusInDB
};
