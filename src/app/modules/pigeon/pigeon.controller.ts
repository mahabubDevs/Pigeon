import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { PigeonService } from "./pigeon.service";
import ApiError from "../../../errors/ApiErrors";
// import { PigeonValidation } from "./pigeon.validation";
import { IUser } from "../user/user.interface";

// Create Pigeon form-data: data (JSON string) + image[fieldName] (multiple files)

const createPigeon = catchAsync(async (req: Request, res: Response) => {
  
  const result = await PigeonService.createPigeonToDB(req.body, req.files, req.user);
  

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Pigeon created successfully",
    data: result,
  });
});


// Update Pigeon

const updatePigeon = catchAsync(async (req: Request, res: Response) => {
  const pigeonId = req.params.id;

  // Parse deletedIndexes from body
  const deletedIndexes: number[] = req.body.deletedIndexes || [];

  // Pass data directly (req.body can contain all fields to update)
  const data = req.body.data || req.body; // fallback to req.body if no data field

  const result = await PigeonService.updatePigeonToDB(
    pigeonId,
    data,
    req.files,
    req.user
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Pigeon updated successfully",
    data: result,
  });
});


// Get all pigeons

const getAllPigeons = catchAsync(async (req: Request, res: Response) => {
  const result = await PigeonService.getAllPigeonsFromDB(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Pigeons retrieved successfully",
    data: result,
  });
});

// Get single pigeon details

const getPigeonDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await PigeonService.getPigeonDetailsFromDB(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Pigeon details retrieved successfully",
    data: result,
  });
});

// Delete pigeon

const deletePigeon = catchAsync(async (req: Request, res: Response) => {
  const result = await PigeonService.deletePigeonFromDB(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Pigeon deleted successfully",
    data: result,
  });
});

// Get pigeon with family members (parents) up to a certain depth
const getPigeonWithFamily = catchAsync(async (req, res) => {
  const pigeonId = req.params.id;

  // const role = req.user?.role?.toLowerCase() || 'user';
  const role = (req.user as IUser).role.toLowerCase();
  const maxDepth = role === "PAIDUSER" ? 5 : 4;

  const pigeon = await PigeonService.getPigeonWithFamily(pigeonId, maxDepth);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Pigeon with family details fetched",
    data: pigeon,
  });
});

// Get siblings of a pigeon
// const getSiblingsController = catchAsync(async (req, res) => {
//   const pigeonId = req.params.id;
//   const data = await PigeonService.getSiblings(pigeonId);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Siblings fetched successfully",
//     data,
//   });
// });

const getSiblingsController = catchAsync(async (req, res) => {
  const pigeonId = req.params.id;
  const siblings = await PigeonService.getSiblings(pigeonId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Siblings fetched successfully",
    data: { siblings },
  });
});


// Import pigeons from Excel file
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

// Export pigeons to PDF
const exportPigeonsPDF = catchAsync(async (req, res) => {
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

const getMyAllPigeons = catchAsync(async (req: Request, res: Response) => {
  const user: any = req.user;

  if (!user?._id) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated");
  }

  const result = await PigeonService.getMyAllPigeonDetailsFromDB(user._id, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "My pigeons retrieved successfully",
    data: result,
  });
});

const searchPigeonsByName = catchAsync(async (req: Request, res: Response) => {
  const { searchTerm } = req.query;

  if (!searchTerm || typeof searchTerm !== "string") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Query param ?q required");
  }

  const result = await PigeonService.searchPigeonsByNameFromDB(searchTerm);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Pigeons search result",
    data: result,
  });
});

const togglePigeonStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await PigeonService.togglePigeonStatusInDB(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Pigeon status changed to ${result.status}`,
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
  getMyPigeons,
  searchPigeonsByName,
  getMyAllPigeons,
  togglePigeonStatus
 
};
