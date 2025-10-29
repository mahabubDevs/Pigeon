import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { BreederService } from "./breeder.service";

export const BreederController = {
  createBreeder: catchAsync(async (req: Request, res: Response) => {
    console.log("Status received:", req.body.status, typeof req.body.status);
    const breeder = await BreederService.createBreeder(req.body);
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Breeder created successfully",
      data: breeder,
    });
  }),

  getAllBreeders: catchAsync(async (req: Request, res: Response) => {
    const breeders = await BreederService.getAllBreeders(req.query); // <-- pass query
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Breeders fetched successfully",
      data: breeders,
    });
  
}),
getVerifyAllBreeders: catchAsync(async (req: Request, res: Response) => {
    const breeders = await BreederService.getVerifyAllBreeders(req.query); // <-- pass query
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Breeders fetched successfully",
      data: breeders,
    });
  }),

  getBreederById: catchAsync(async (req: Request, res: Response) => {
    const breeder = await BreederService.getBreederById(req.params.id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Breeder fetched successfully",
      data: breeder,
    });
  }),

  updateBreeder: catchAsync(async (req: Request, res: Response) => {
    const updated = await BreederService.updateBreeder(req.params.id, req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Breeder updated successfully",
      data: updated,
    });
  }),

  deleteBreeder: catchAsync(async (req: Request, res: Response) => {
    const deleted = await BreederService.deleteBreeder(req.params.id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Breeder deleted successfully",
      data: deleted,
    });
  }),
};
