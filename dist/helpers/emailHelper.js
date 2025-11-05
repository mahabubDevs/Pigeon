"use strict";
// // email.helper.ts
// import nodemailer from 'nodemailer';
// import { logger, errorLogger } from '../shared/logger';
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
exports.emailHelper = void 0;
// // SMTP Configuration
// const transporter = nodemailer.createTransport({
//   host: 'server-624725.thepigeonhub.com', // mail server host
//   port: 465,                                    // SSL port
//   secure: true,                                 // true for SSL
//   auth: {
//     user: process.env.SMTP_USER || 'info@thepigeonhub.com',
//     pass: process.env.SMTP_PASS || 'Daalstraat16',
//   },
//   tls: {
//     rejectUnauthorized: false,                 // fallback for SSL hostname mismatch
//   },
//   logger: true,
//   debug: true,
// });
// // Verify SMTP connection at startup
// transporter.verify((err, success) => {
//   if (err) {
//     console.error('SMTP verification failed:', err.message);
//   } else {
//     console.log('SMTP verification successful!');
//   }
// });
// // Interface for email input
// interface ISendEmail {
//   to: string;
//   subject: string;
//   html: string;
// }
// // Function to send email
// const sendEmail = async ({ to, subject, html }: ISendEmail) => {
//   try {
//     const info = await transporter.sendMail({
//       from: `"Pigeon Hub" <info@thepigeonhub.com>`, // mailbox name must match
//       to,
//       subject,
//       html,
//     });
//     logger.info('Email sent successfully to:', to);
//     return { success: true, info };
//   } catch (error: any) {
//     errorLogger.error('Email sending failed:', error);
//     return { success: false, error: error.message };
//   }
// };
// // Export helper
// export const emailHelper = {
//   sendEmail,
// };
// // ===== Example usage in registration flow =====
// // import { emailHelper } from './email.helper';
// // const verificationLink = `https://yourdomain.com/verify?token=${token}`;
// // await emailHelper.sendEmail({
// //   to: newUser.email,
// //   subject: 'Verify your account',
// //   html: `<p>Hello ${newUser.name},</p>
// //          <p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
// // });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const logger_1 = require("../shared/logger");
const transporter = nodemailer_1.default.createTransport({
    host: config_1.default.email.host,
    port: Number(config_1.default.email.port),
    secure: true,
    auth: {
        user: config_1.default.email.user,
        pass: config_1.default.email.pass
    },
});
const sendEmail = (values) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("email function");
    try {
        const info = yield transporter.sendMail({
            from: `"ThePigeonHub.com" ${config_1.default.email.from}`,
            to: values.to,
            subject: values.subject,
            html: values.html,
        });
        logger_1.logger.info('Mail send successfully', info.accepted);
    }
    catch (error) {
        logger_1.errorLogger.error('Email', error);
    }
});
exports.emailHelper = {
    sendEmail
};
