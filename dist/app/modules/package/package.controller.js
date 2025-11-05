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
exports.PackageController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const package_service_1 = require("./package.service");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const createPackage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, features } = req.body;
    if (!title || title.trim() === "") {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Title is required");
    }
    if (!features || !Array.isArray(features) || features.length === 0) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Features field is required and must be a non-empty array");
    }
    const payload = Object.assign(Object.assign({}, req.body), { admin: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
    console.log("Payload before DB save:", payload);
    const result = yield package_service_1.PackageService.createPackageToDB(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Package created Successfully",
        data: result,
    });
}));
const updatePackage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield package_service_1.PackageService.updatePackageToDB(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Package updated Successfully",
        data: result
    });
}));
const getPackage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield package_service_1.PackageService.getPackageFromDB(req.query.paymentType);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Package Retrieved Successfully",
        data: result
    });
}));
const packageDetails = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield package_service_1.PackageService.getPackageDetailsFromDB(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Package Details Retrieved Successfully",
        data: result
    });
}));
const deletePackage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield package_service_1.PackageService.deletePackageToDB(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Package Deleted Successfully",
        data: result
    });
}));
exports.PackageController = {
    createPackage,
    updatePackage,
    getPackage,
    packageDetails,
    deletePackage
};
