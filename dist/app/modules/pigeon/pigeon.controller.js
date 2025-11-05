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
exports.PigeonController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const pigeon_service_1 = require("./pigeon.service");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const pigeon_model_1 = require("./pigeon.model");
const loft_model_1 = require("../loft/loft.model");
// Create Pigeon form-data: data (JSON string) + image[fieldName] (multiple files)
const createPigeon = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield pigeon_service_1.PigeonService.createPigeonToDB(req.body, req.files, req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Pigeon created successfully",
        data: result,
    });
}));
// Update Pigeon
const updatePigeon = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pigeonId = req.params.id;
    console.log("Pigeon ID to update:", pigeonId);
    console.log("Files received:", req.files);
    // Parse deletedIndexes from body
    const deletedIndexes = req.body.deletedIndexes || [];
    // Pass data directly (req.body can contain all fields to update)
    const data = req.body.data || req.body; // fallback to req.body if no data field
    console.log("Updating Pigeon ID:", data);
    const result = yield pigeon_service_1.PigeonService.updatePigeonToDB(pigeonId, data, req.files, req.user);
    // console.log("Update Result:", result);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Pigeon updated successfully",
        data: result,
    });
}));
// Get all pigeons
const getAllPigeons = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield pigeon_service_1.PigeonService.getAllPigeonsFromDB(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Pigeons retrieved successfully",
        data: result,
    });
}));
// Get all pigeons admins
const getAllPigeonsAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield pigeon_service_1.PigeonService.getAllPigeonsAdminsFromDB(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Pigeons retrieved successfully",
        data: result,
    });
}));
// Get single pigeon details
const getPigeonDetails = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield pigeon_service_1.PigeonService.getPigeonDetailsFromDB(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Pigeon details retrieved successfully",
        data: result,
    });
}));
// Delete pigeon
const deletePigeon = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield pigeon_service_1.PigeonService.deletePigeonFromDB(req.params.id, req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Pigeon deleted successfully",
        data: result,
    });
}));
// Get pigeon with family members (parents) up to a certain depth
const getPigeonWithFamily = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pigeonId = req.params.id;
    // const role = req.user?.role?.toLowerCase() || 'user';
    const role = req.user.role.toLowerCase();
    const maxDepth = role === "PAIDUSER" ? 5 : 4;
    const pigeon = yield pigeon_service_1.PigeonService.getPigeonWithFamily(pigeonId, maxDepth);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Pigeon with family details fetched",
        data: pigeon,
    });
}));
// Get siblings of a pigeon
// const getSiblingsController = catchAsync(async (req, res) => {
//   const pigeonId = req.params.id;
//   const data = await PigeonService.getSiblings(pigeonId);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Siblings fetched successfully",
//     data,
//   });
// });
const getSiblingsController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pigeonId = req.params.id;
    const siblings = yield pigeon_service_1.PigeonService.getSiblings(pigeonId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Siblings fetched successfully",
        data: { siblings },
    });
}));
// Import pigeons from Excel file
const importPigeons = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files || !("excel" in req.files)) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Excel file required");
    }
    const file = req.files.excel[0];
    const pigeons = yield pigeon_service_1.PigeonService.importFromExcel(file.path, req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Pigeons imported successfully",
        data: pigeons,
    });
}));
// Export pigeons to PDF
const exportPigeonsPDF = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pdfBuffer = yield pigeon_service_1.PigeonService.exportToPDF(req.query);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=pigeons.pdf");
    res.send(pdfBuffer);
}));
const getMyPigeons = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield pigeon_service_1.PigeonService.getMyPigeonsFromDB(req.user, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "My pigeons retrieved successfully",
        data: result,
    });
}));
const getMyAllPigeons = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!(user === null || user === void 0 ? void 0 : user._id)) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    const result = yield pigeon_service_1.PigeonService.getMyAllPigeonDetailsFromDB(user._id, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "My pigeons retrieved successfully",
        data: result,
    });
}));
const searchPigeonsByName = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm } = req.query;
    if (!searchTerm || typeof searchTerm !== "string") {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Query param ?q required");
    }
    const result = yield pigeon_service_1.PigeonService.searchPigeonsByNameFromDB(searchTerm);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Pigeons search result",
        data: result,
    });
}));
const searchAllPigeonsByName = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm } = req.query;
    if (!searchTerm || typeof searchTerm !== "string") {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Query param ?q required");
    }
    const result = yield pigeon_service_1.PigeonService.searchAllPigeonsByNameFromDB(searchTerm);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Pigeons search result",
        data: result,
    });
}));
const searchAllName = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const { searchTerm } = req.query;
    // if (!searchTerm || typeof searchTerm !== "string") {
    //   throw new ApiError(StatusCodes.BAD_REQUEST, "Query param ?q required");
    // }
    const result = yield pigeon_service_1.PigeonService.searchAllPigeonsName();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Pigeons search result",
        data: result,
    });
}));
const togglePigeonStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield pigeon_service_1.PigeonService.togglePigeonStatusInDB(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: `Pigeon status changed to ${result.status}`,
        data: result,
    });
}));
const addToLoft = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user; // Type assertion to include _id
    if (!user || !user._id) {
        throw new ApiErrors_1.default(401, "User not authenticated");
    }
    const { pigeonId } = req.body; // frontend থেকে pigeon id পাঠাবে
    const userId = user._id; // লগইন করা user
    // প্রথমে check করো pigeon টা আসলেই আছে কিনা এবং verified কিনা
    const pigeon = yield pigeon_model_1.Pigeon.findOne({ _id: pigeonId, verified: true });
    if (!pigeon) {
        throw new ApiErrors_1.default(404, "Pigeon not found or not verified");
    }
    // 2️⃣ Check if already added in UserLoft
    const existing = yield loft_model_1.UserLoft.findOne({ user: userId, pigeon: pigeon._id });
    if (existing) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: 400,
            message: "Already added to your loft",
        });
    }
    // তারপর সেই pigeon user এর Loft এ add করো
    const added = yield loft_model_1.UserLoft.findOneAndUpdate({ user: userId, pigeon: pigeon._id }, // খুঁজবে আগেই আছে কিনা
    { user: userId, pigeon: pigeon._id }, // না থাকলে এই data insert করবে
    { upsert: true, new: true, setDefaultsOnInsert: true });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: "Pigeon added to your loft successfully",
        data: added,
    });
}));
exports.PigeonController = {
    createPigeon,
    updatePigeon,
    getAllPigeons,
    getAllPigeonsAdmin,
    getPigeonDetails,
    deletePigeon,
    getPigeonWithFamily,
    getSiblingsController,
    importPigeons,
    exportPigeonsPDF,
    getMyPigeons,
    searchPigeonsByName,
    searchAllPigeonsByName,
    searchAllName,
    getMyAllPigeons,
    togglePigeonStatus,
    addToLoft
};
