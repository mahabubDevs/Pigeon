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
exports.BreederService = void 0;
const breeder_model_1 = require("./breeder.model");
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const queryBuilder_1 = __importDefault(require("../../../util/queryBuilder"));
exports.BreederService = {
    createBreeder: (data) => __awaiter(void 0, void 0, void 0, function* () {
        data.status = Boolean(data.status); // force cast
        const result = yield breeder_model_1.Breeder.create(data);
        return result;
    }),
    getAllBreeders: (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
        // Step 1: Define searchable fields (যেখানে search করতে চাও)
        const searchableFields = ["email", "breederName", "country", "loftName"]; // example fields
        // Step 2: Define filterable fields (extra fields besides search)
        // যেগুলো cleanObject এ filter হবে automatically
        // Step 3: Build the query
        const builder = new queryBuilder_1.default(breeder_model_1.Breeder.find(), query)
            .search(searchableFields) // searchable fields দিতে হবে খালি নয়
            .filter()
            .sort()
            .paginate()
            .fields();
        // Step 4: Execute query
        const breeder = yield builder.modelQuery;
        const pagination = yield builder.getPaginationInfo();
        return { pagination, breeder };
    }),
    getBreederById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        return breeder_model_1.Breeder.findById(id).lean();
    }),
    updateBreeder: (id, data) => __awaiter(void 0, void 0, void 0, function* () {
        const updated = yield breeder_model_1.Breeder.findByIdAndUpdate(id, data, { new: true });
        if (!updated)
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Breeder not found");
        return updated;
    }),
    deleteBreeder: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const deleted = yield breeder_model_1.Breeder.findByIdAndDelete(id);
        if (!deleted)
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Breeder not found");
        return deleted;
    }),
};
