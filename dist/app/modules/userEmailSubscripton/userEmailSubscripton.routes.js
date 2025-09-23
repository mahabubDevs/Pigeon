"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSubscriptionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const userEmailSubscripton_controller_1 = require("./userEmailSubscripton.controller");
const router = express_1.default.Router();
router.post('/', userEmailSubscripton_controller_1.SubscriptionController.createSubscription);
exports.UserSubscriptionRoutes = router;
