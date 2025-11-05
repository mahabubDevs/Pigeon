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
exports.BreederController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const breeder_service_1 = require("./breeder.service");
exports.BreederController = {
    createBreeder: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Status received:", req.body.status, typeof req.body.status);
        const breeder = yield breeder_service_1.BreederService.createBreeder(req.body);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_codes_1.StatusCodes.CREATED,
            success: true,
            message: "Breeder created successfully",
            data: breeder,
        });
    })),
    getAllBreeders: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const breeders = yield breeder_service_1.BreederService.getAllBreeders(req.query); // <-- pass query
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            message: "Breeders fetched successfully",
            data: breeders,
        });
    })),
    getVerifyAllBreeders: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const breeders = yield breeder_service_1.BreederService.getVerifyAllBreeders(req.query); // <-- pass query
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            message: "Breeders fetched successfully",
            data: breeders,
        });
    })),
    getBreederById: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const breeder = yield breeder_service_1.BreederService.getBreederById(req.params.id);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            message: "Breeder fetched successfully",
            data: breeder,
        });
    })),
    updateBreeder: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const updated = yield breeder_service_1.BreederService.updateBreeder(req.params.id, req.body);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            message: "Breeder updated successfully",
            data: updated,
        });
    })),
    deleteBreeder: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const deleted = yield breeder_service_1.BreederService.deleteBreeder(req.params.id);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            message: "Breeder deleted successfully",
            data: deleted,
        });
    })),
};
