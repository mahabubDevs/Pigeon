import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ContactService } from './contact.service';

// create contact
const createContact = catchAsync(async (req: Request, res: Response) => {
  const { ...contactData } = req.body;
  const result = await ContactService.createContactToDB(contactData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.result,
  });
});

export const ContactController = {
  createContact,
};
