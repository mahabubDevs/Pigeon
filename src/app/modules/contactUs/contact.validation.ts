import { z } from 'zod';

const createContactZodSchema = z.object({
  body: z.object({
    firstName: z.string({ required_error: 'First name is required' }),
    lastName: z.string({ required_error: 'Last name is required' }),
    email: z.string({ required_error: 'Email is required' }).email(),
    phone: z.string({ required_error: 'Phone is required' }),
    subject: z.string({ required_error: 'Subject is required' }),
    description: z.string({ required_error: 'Description is required' }),
  }),
});

export const ContactValidation = {
  createContactZodSchema,
};
