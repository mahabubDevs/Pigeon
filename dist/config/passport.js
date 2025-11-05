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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_facebook_1 = require("passport-facebook");
const _1 = __importDefault(require("."));
const user_model_1 = require("../app/modules/user/user.model");
// 🔹 Google OAuth Strategy
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: _1.default.social.google_client_id,
    clientSecret: _1.default.social.google_client_secret,
    callbackURL: "https://nadir.binarybards.online/api/v1/auth/google/callback",
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let user = yield user_model_1.User.findOne({ appId: profile.id });
        if (!user) {
            user = yield user_model_1.User.create({
                appId: profile.id,
                name: profile.displayName,
                email: (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value,
            });
        }
        done(null, user);
    }
    catch (error) {
        done(error, false);
    }
})));
// 🔹 Facebook OAuth Strategy
passport_1.default.use(new passport_facebook_1.Strategy({
    clientID: _1.default.social.facebook_client_id,
    clientSecret: _1.default.social.facebook_client_secret,
    callbackURL: "https://nadir.binarybards.online/api/v1/auth/facebook/callback",
    profileFields: ["id", "displayName", "emails"],
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let user = yield user_model_1.User.findOne({ appId: profile.id });
        if (!user) {
            user = yield user_model_1.User.create({
                appId: profile.id,
                name: profile.displayName,
                email: (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value,
            });
        }
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
})));
// 🔹 Serialize & Deserialize User
passport_1.default.serializeUser((user, done) => {
    done(null, user.id); // শুধু id save হবে session এ
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findById(id);
        done(null, user); // full user object req.user এ থাকবে
    }
    catch (error) {
        done(error, null);
    }
}));
exports.default = passport_1.default;
