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
exports.authWithPageAccess = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiErrors_1 = __importDefault(require("../../errors/ApiErrors"));
const http_status_codes_1 = require("http-status-codes");
const user_1 = require("../../enums/user");
const config_1 = __importDefault(require("../../config"));
const user_model_1 = require("../modules/user/user.model");
const authWithPageAccess = (page) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // 1. Get token directly from header
            const token = (req.headers.authorization || '').replace(/^Bearer\s/, '');
            if (!token) {
                return next(new ApiErrors_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Not authenticated'));
            }
            // 2. Verify token
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.jwt_secret);
            if (!decoded.role) {
                return next(new ApiErrors_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Role not found in token'));
            }
            req.user = {
                _id: decoded.id,
                role: decoded.role,
                email: decoded.email,
            };
            // 3. Role check
            if ([user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN].includes(decoded.role)) {
                return next();
            }
            // 4. Page access check
            const user = yield user_model_1.User.findById(decoded.id).select('pages');
            if ((_a = user === null || user === void 0 ? void 0 : user.pages) === null || _a === void 0 ? void 0 : _a.includes(page)) {
                req.user.pages = user.pages;
                return next();
            }
            return next(new ApiErrors_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Access denied'));
        }
        catch (error) {
            return next(new ApiErrors_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid token'));
        }
    });
};
exports.authWithPageAccess = authWithPageAccess;
