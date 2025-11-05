"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactValidation = void 0;
const zod_1 = require("zod");
const createContactZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string({ required_error: 'First name is required' }),
        lastName: zod_1.z.string({ required_error: 'Last name is required' }),
        email: zod_1.z.string({ required_error: 'Email is required' }).email(),
        phone: zod_1.z.string({ required_error: 'Phone is required' }),
        subject: zod_1.z.string({ required_error: 'Subject is required' }),
        description: zod_1.z.string({ required_error: 'Description is required' }),
    }),
});
exports.ContactValidation = {
    createContactZodSchema,
};
