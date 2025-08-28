import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { PigeonService } from "./pigeon.service";
import ApiError from "../../../errors/ApiErrors";
import { PigeonValidation } from "./pigeon.validation";

/**
 * Create Pigeon
 * form-data: data (JSON string) + image[fieldName] (multiple files)
 */
const createPigeon = catchAsync(async (req: Request, res: Response) => {
  const result = await PigeonService.createPigeonToDB(req.body.data, req.files, req.user);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Pigeon created successfully",
    data: result,
  });
});


/**
 * Update Pigeon
 * form-data: data (JSON string) + image[fieldName] (optional)
 */
const updatePigeon = catchAsync(async (req: Request, res: Response) => {
  const pigeonId = req.params.id;
  const deletedIndexes: number[] = req.body.deletedIndexes || []; // যেসব image remove করতে চাইছে
  const result = await PigeonService.updatePigeonToDB(
    pigeonId,
    req.body.data,
    req.files,
    deletedIndexes,
    req.user
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Pigeon updated successfully",
    data: result,
  });
});
/**
 * Get all pigeons
 */
const getAllPigeons = catchAsync(async (req: Request, res: Response) => {
  const result = await PigeonService.getAllPigeonsFromDB( req.query );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Pigeons retrieved successfully",
    data: result,
  });
});

/**
 * Get single pigeon details
 */
const getPigeonDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await PigeonService.getPigeonDetailsFromDB(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Pigeon details retrieved successfully",
    data: result,
  });
});

/**
 * Delete pigeon
 */
const deletePigeon = catchAsync(async (req: Request, res: Response) => {
  const result = await PigeonService.deletePigeonFromDB(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Pigeon deleted successfully",
    data: result,
  });
});


const getPigeonWithFamily = catchAsync(async (req, res) => {
  const pigeonId = req.params.id;
  const pigeon = await PigeonService.getPigeonWithFamily(pigeonId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Pigeon with family details fetched',
    data: pigeon
  });
});


const getSiblingsController = catchAsync(async (req, res) => {
  const pigeonId = req.params.id;
  const data = await PigeonService.getSiblings(pigeonId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Siblings fetched successfully',
    data
  });
});


// pigeon.controller.ts
const importPigeons = catchAsync(async (req, res) => {
  if (!req.files || !("excel" in req.files)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Excel file required");
  }
  const file = (req.files as any).excel[0];
  const pigeons = await PigeonService.importFromExcel(file.path, req.user);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Pigeons imported successfully",
    data: pigeons,
  });
});

const exportPigeonsPDF = catchAsync(async (req, res) => {
  // req.query তে সব filter/pagination আছে
  const pdfBuffer = await PigeonService.exportToPDF(req.query);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=pigeons.pdf");
  res.send(pdfBuffer);
});

const getMyPigeons = catchAsync(async (req: Request, res: Response) => {
  const result = await PigeonService.getMyPigeonsFromDB(req.user, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "My pigeons retrieved successfully",
    data: result,
  });
});




export const PigeonController = {
  createPigeon,
  updatePigeon,
  getAllPigeons,
  getPigeonDetails,
  deletePigeon,
  getPigeonWithFamily,
  getSiblingsController,
  importPigeons,
  exportPigeonsPDF,
  getMyPigeons
};
