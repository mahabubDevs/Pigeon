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
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = require("../app/modules/user/user.model");
const generateUsername = (name) => __awaiter(void 0, void 0, void 0, function* () {
    let base = name ? name.toLowerCase().replace(/\s/g, '') : 'user';
    let username = '';
    let exists = true;
    while (exists) {
        const random = crypto_1.default.randomBytes(3).toString('hex'); // 6 character random
        username = `${base}${random}`;
        const user = yield user_model_1.User.findOne({ username });
        if (!user)
            exists = false; // unique হলে break
    }
    return username;
});
exports.default = generateUsername;
