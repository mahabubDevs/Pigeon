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
exports.ContactService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../../../config")); // <--- ai file import kora hoise
const contact_module_1 = require("./contact.module");
const createContactToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Save contact in DB
    const result = yield contact_module_1.Contact.create(payload);
    // Send email to admin using config
    const transporter = nodemailer_1.default.createTransport({
        host: config_1.default.email.host,
        port: Number(config_1.default.email.port),
        secure: false, // use true if port is 465
        auth: {
            user: config_1.default.email.user,
            pass: config_1.default.email.pass,
        },
    });
    yield transporter.sendMail({
        from: `"Website Contact" <${config_1.default.email.user}>`,
        to: config_1.default.admin.email,
        subject: `New Contact Message: ${payload.subject}`,
        text: `
Name: ${payload.firstName} ${payload.lastName}
Email: ${payload.email}
Phone: ${payload.phone}
Subject: ${payload.subject}
Message: ${payload.description}
    `,
    });
    const message = 'Contact message sent successfully';
    return { message, result };
});
exports.ContactService = {
    createContactToDB,
};
