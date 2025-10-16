import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IPigeon } from "./pigeon.interface";
import { Pigeon } from "./pigeon.model";
import mongoose from "mongoose";
// import    from "../../../helpers/pdfHelper";
import XLSX from "xlsx";
import QueryBuilder from "../../../util/queryBuilder";
import pdfDoc from "../../../helpers/pdfHelper";
import { NotificationService } from "../notification/notification.service";
import { userEmailSubscripton } from "../userEmailSubscripton/userEmailSubscripton.model";
import { emailHelper } from "../../../helpers/emailHelper";
import { JwtPayload } from "jsonwebtoken";
import { USER_ROLES } from "../../../enums/user";
import { User } from "../user/user.model";
import {  UserLoft } from "../loft/loft.model";
import { Breeder } from "../breeder/breeder.model";
import { Loft } from "../loft/verifyloft.model";

// Create Pigeon in DB


// const createPigeonToDB = async (data: any, files: any, user: any) => {
//   if (!data) throw new ApiError(StatusCodes.BAD_REQUEST, "Data field is required");
//   if (!user?._id) throw new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated");

//   // Free user validation
//   if (user.role === "USER") {
//     const pigeonCount = await Pigeon.countDocuments({ user: user._id });
//     if (pigeonCount >= 50)
//       throw new ApiError(StatusCodes.FORBIDDEN, "Free users can only add up to 50 pigeons");
//   }

//   const parsedData: any = { ...data };

//   // Numeric conversion
// ["birthYear", "racerRating", "breederRating", "racingRating"].forEach(field => {
//     if (parsedData[field] !== undefined) {
//         parsedData[field] = Number(parsedData[field]);
//     }
// });

//   // Free user restrictions
//   if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
//     parsedData.verified = false;
//     parsedData.iconic = false;
//     parsedData.iconicScore = 0;
//   }

//   // Father/Mother Ring
//   if (parsedData.fatherRingId && parsedData.fatherRingId.trim() !== "") {
//     const father = await Pigeon.findOne({ ringNumber: parsedData.fatherRingId });
//     if (!father) throw new ApiError(StatusCodes.BAD_REQUEST, "Father pigeon not found");
//     parsedData.fatherRingId = father._id;
//   } else {
//     parsedData.fatherRingId = null;
//   }

//   if (parsedData.motherRingId && parsedData.motherRingId.trim() !== "") {
//     const mother = await Pigeon.findOne({ ringNumber: parsedData.motherRingId });
//     if (!mother) throw new ApiError(StatusCodes.BAD_REQUEST, "Mother pigeon not found");
//     parsedData.motherRingId = mother._id;
//   } else {
//     parsedData.motherRingId = null;
//   }

//   // Handle photos
//   const photos: string[] = [];
//   if (files && Object.keys(files).length > 0) {
//     const filesArray: Express.Multer.File[] = Object.values(files).flat() as Express.Multer.File[];
//     filesArray.forEach(file => photos.push(`/images/${file.filename}`));
//   }
//   parsedData.photos = photos;

//   // Handle optional results array
//   if (!parsedData.results) {
//     parsedData.results = []; // empty array if not provided
//   } else if (typeof parsedData.results === "string") {
//     try {
//       parsedData.results = JSON.parse(parsedData.results);
//       if (!Array.isArray(parsedData.results)) parsedData.results = [];
//     } catch {
//       parsedData.results = [];
//     }
//   } else if (!Array.isArray(parsedData.results)) {
//     parsedData.results = [];
//   }

//   // Save to DB
//   const payload = { ...parsedData, user: user._id };
//   const result = await Pigeon.create(payload);
//   if (!result) throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create pigeon");

//  // Fetch sender from DB
// const sender = await User.findById(user._id).select("name");
// console.log(sender ,"sender ");

// // Notification
// // await NotificationService.createNotificationToDB({
// //   text: `New pigeon added by ${sender?.name || "Unknown User"}`, // ✅ use sender.name
// //   type: "ADMIN",
// //   referenceId: result._id.toString(),
// //   read: false,
// // });

// if (user.role === "USER") {
//   // সাধারণ USER অ্যাড করলে শুধু Admin পাবে
//   const admins = await User.find({ role: "ADMIN" }).select("_id name");
//   for (const admin of admins) {
//     await NotificationService.createNotificationToDB({
//       text: `New pigeon added by ${sender?.name || "Unknown User"}`,
//       type: "ADMIN",
//       receiver: admin._id, // শুধু Admin
//       referenceId: result._id.toString(),
//       read: false,
//     });
//   }
// } else if (user.role === "ADMIN") {
//   // Admin অ্যাড করলে সব USER এবং PAIDUSER পাবে
//   const users = await User.find({ role: { $in: ["USER", "PAIDUSER"] } }).select("_id name");
//   for (const u of users) {
//     await NotificationService.createNotificationToDB({
//       text: `New pigeon added by ${sender?.name || "Admin"}`,
//       type: u.role as "USER" | "PAIDUSER", // Type অনুযায়ী assign
//       receiver: u._id,
//       referenceId: result._id.toString(),
//       read: false,
//     });
//   }
// }


//   return result;
// };

//real pigoen create 
// const createPigeonToDB = async (data: any, files: any, user: any) => {
//   if (!data) throw new ApiError(StatusCodes.BAD_REQUEST, "Data field is required");
//   if (!user?._id) throw new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated");

//   // Free user validation
//   if (user.role === "USER") {
//     const pigeonCount = await Pigeon.countDocuments({ user: user._id });
//     if (pigeonCount >= 50)
//       throw new ApiError(StatusCodes.FORBIDDEN, "Free users can only add up to 50 pigeons");
//   }

//   const parsedData: any = { ...data };

//   // Numeric conversion
//   ["birthYear", "racerRating", "breederRating", "racingRating"].forEach(field => {
//     if (parsedData[field] !== undefined) {
//       parsedData[field] = Number(parsedData[field]);
//     }
//   });

//   // Free user restrictions
//   if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
//     parsedData.verified = false;
//     parsedData.iconic = false;
//     parsedData.iconicScore = 0;
//   }

//   // Father/Mother Ring
//   if (parsedData.fatherRingId && parsedData.fatherRingId.trim() !== "") {
//     const father = await Pigeon.findOne({ ringNumber: parsedData.fatherRingId });
//     if (!father) throw new ApiError(StatusCodes.BAD_REQUEST, "Father pigeon not found");
//     parsedData.fatherRingId = father._id;
//   } else {
//     parsedData.fatherRingId = null;
//   }

//   if (parsedData.motherRingId && parsedData.motherRingId.trim() !== "") {
//     const mother = await Pigeon.findOne({ ringNumber: parsedData.motherRingId });
//     if (!mother) throw new ApiError(StatusCodes.BAD_REQUEST, "Mother pigeon not found");
//     parsedData.motherRingId = mother._id;
//   } else {
//     parsedData.motherRingId = null;
//   }

//   // Handle breeder (new logic)
//   if (parsedData.breeder && parsedData.breeder.trim() !== "") {
//     let existingBreeder = await Breeder.findOne({ breederName: parsedData.breeder });

//     if (existingBreeder) {
//       parsedData.breeder = existingBreeder._id;
//     } else {
//       const newBreeder = await Breeder.create({
//         loftName: parsedData.breeder,
//         breederName: parsedData.breeder,
//         status: false, // not verified
//         experience: "none",
//         country: parsedData.country || "Unknown",
//       });
//       parsedData.breeder = newBreeder._id;
//     }
//   } else {
//     parsedData.breeder = null;
//   }

//   // Handle individual photo fields
//   const photoFields = ["pigeonPhoto", "eyePhoto", "ownershipPhoto", "pedigreePhoto", "DNAPhoto"];
//   photoFields.forEach(field => {
//     if (files && files[field] && files[field][0]) {
//       parsedData[field] = `/images/${files[field][0].filename}`;
//     }
//   });

//   // Handle extra multiple photos array
//   const extraPhotosField = "photos"; // ধরো form-data তে multiple extra images
//   const photos: string[] = [];
//   if (files && files[extraPhotosField]) {
//     const filesArray: Express.Multer.File[] = files[extraPhotosField];
//     filesArray.forEach(file => photos.push(`/images/${file.filename}`));
//   }
//   parsedData.photos = photos;

//   // Handle optional results array
//   if (!parsedData.results) {
//     parsedData.results = []; // empty array if not provided
//   } else if (typeof parsedData.results === "string") {
//     try {
//       parsedData.results = JSON.parse(parsedData.results);
//       if (!Array.isArray(parsedData.results)) parsedData.results = [];
//     } catch {
//       parsedData.results = [];
//     }
//   } else if (!Array.isArray(parsedData.results)) {
//     parsedData.results = [];
//   }

//   // Save to DB
//   const payload = { ...parsedData, user: user._id };
//   const result = await Pigeon.create(payload);
//   if (!result) throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create pigeon");

//   // Fetch sender info
//   const sender = await User.findById(user._id).select("name");
//   if (!sender) throw new ApiError(StatusCodes.NOT_FOUND, "Sender not found");

//   // 🔔 Notifications
//   if (["USER", "PAIDUSER"].includes(user.role)) {
//     const admins = await User.find({ role: { $in: ["ADMIN", "SUPER_ADMIN"] } }).select("_id");
//     const receiverIds = admins.map(a => a._id);

//     if (receiverIds.length > 0) {
//       await NotificationService.createNotificationToDB({
//         text: `Pigeon added by ${sender.name}`,
//         type: "ADMIN",
//         receiver: receiverIds,
//         referenceId: result._id.toString(),
//         read: false,
//       });
//     }
//   } else if (["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
//     const users = await User.find({ role: { $in: ["USER", "PAIDUSER"] } }).select("_id");
//     const receiverIds = users.map(u => u._id);

//     if (receiverIds.length > 0) {
//       await NotificationService.createNotificationToDB({
//         text: `Pigeon added by ${sender.name}`,
//         type: "USER",
//         receiver: receiverIds,
//         referenceId: result._id.toString(),
//         read: false,
//       });
//     }
//   }

//   return result;
// };





const createPigeonToDB = async (data: any, files: any, user: any) => {
  if (!data) throw new ApiError(StatusCodes.BAD_REQUEST, "Data field is required");
  if (!user?._id) throw new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated");

  const parsedData: any = { ...data };

  // Free user validation
  if (user.role === "USER") {
    const pigeonCount = await Pigeon.countDocuments({ user: user._id });
    if (pigeonCount >= 50)
      throw new ApiError(StatusCodes.FORBIDDEN, "Free users can only add up to 50 pigeons");
  }

  // Numeric conversion
  ["birthYear", "racerRating", "breederRating", "racingRating"].forEach(field => {
    if (parsedData[field] !== undefined) parsedData[field] = Number(parsedData[field]);
  });

  // Free user restrictions
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    parsedData.verified = false;
    parsedData.iconic = false;
    parsedData.iconicScore = 0;
  }

  // Father/Mother ring logic
  if (parsedData.fatherRingId && parsedData.fatherRingId.trim() !== "") {
    let father = await Pigeon.findOne({ ringNumber: parsedData.fatherRingId });
    if (!father) {
      father = await Pigeon.create({ ringNumber: parsedData.fatherRingId, verified: false, user: user._id });
    }
    parsedData.fatherRingId = father._id;
  } else parsedData.fatherRingId = null;

  if (parsedData.motherRingId && parsedData.motherRingId.trim() !== "") {
    let mother = await Pigeon.findOne({ ringNumber: parsedData.motherRingId });
    if (!mother) {
      mother = await Pigeon.create({ ringNumber: parsedData.motherRingId, verified: false, user: user._id });
    }
    parsedData.motherRingId = mother._id;
  } else parsedData.motherRingId = null;



console.log("Incoming data:", data);
console.log("Parsed data before breeder:", parsedData);



   // Breeder logic
if (parsedData.breeder && parsedData.breeder.trim() !== "") {
  console.log("Breeder empty or undefined, deleting key");
  let existingBreeder = await Breeder.findOne({ breederName: parsedData.breeder });
  if (existingBreeder) parsedData.breeder = existingBreeder._id;
  else {
    const newBreeder = await Breeder.create({
      loftName: parsedData.breeder,
      breederName: parsedData.breeder,
      status: false,
      experience: "none",
      country: parsedData.country || "Unknown",
    });
    parsedData.breeder = newBreeder._id;
  }
} else {
  console.log("Breeder exists:", parsedData.breeder);
  parsedData.breeder = null; // null নয়, undefined পাঠান
}

console.log("Parsed data before Pigeon.create:", parsedData);
  // Check if verified pigeon with same name OR ringNumber exists
  const verifiedExist = await Pigeon.findOne({
    $or: [
      { ringNumber: parsedData.ringNumber },
      { name: parsedData.name },
    ],
    verified: true,
  });

  if (verifiedExist) {
    // Loft create instead of pigeon
    const loftData = {
      loftName: parsedData.name,
      breeder: parsedData.breeder,
      country: parsedData.country || "Unknown",
      status: false,
    };
    const loft = await Loft.create(loftData);
    return { message: "Pigeon already verified, added to Loft instead.", loft };
  }

  // Handle individual photos
  const photoFields = ["pigeonPhoto", "eyePhoto", "ownershipPhoto", "pedigreePhoto", "DNAPhoto"];
  photoFields.forEach(field => {
    if (files && files[field] && files[field][0]) parsedData[field] = `/images/${files[field][0].filename}`;
  });

  // Extra photos
  const extraPhotosField = "photos";
  parsedData.photos = [];
  if (files && files[extraPhotosField]) {
    files[extraPhotosField].forEach((file: Express.Multer.File) => parsedData.photos.push(`/images/${file.filename}`));
  }

  // Optional results
  if (!parsedData.results) parsedData.results = [];
  else if (typeof parsedData.results === "string") {
    try {
      parsedData.results = JSON.parse(parsedData.results);
      if (!Array.isArray(parsedData.results)) parsedData.results = [];
    } catch {
      parsedData.results = [];
    }
  }

  // Save pigeon
  parsedData.user = user._id;
  const result = await Pigeon.create(parsedData);

  // Notifications
  const sender = await User.findById(user._id).select("name");
  if (!sender) throw new ApiError(StatusCodes.NOT_FOUND, "Sender not found");

  if (["USER", "PAIDUSER"].includes(user.role)) {
    const admins = await User.find({ role: { $in: ["ADMIN", "SUPER_ADMIN"] } }).select("_id");
    const receiverIds = admins.map(a => a._id);
    if (receiverIds.length > 0) {
      await NotificationService.createNotificationToDB({
        text: `Pigeon added by ${sender.name}`,
        type: "ADMIN",
        receiver: receiverIds,
        referenceId: result._id.toString(),
        read: false,
      });
    }
  } else if (["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    const users = await User.find({ role: { $in: ["USER", "PAIDUSER"] } }).select("_id");
    const receiverIds = users.map(u => u._id);
    if (receiverIds.length > 0) {
      await NotificationService.createNotificationToDB({
        text: `Pigeon added by ${sender.name}`,
        type: "USER",
        receiver: receiverIds,
        referenceId: result._id.toString(),
        read: false,
      });
    }
  }

  return result;
};


//real update code


// const updatePigeonToDB = async (
//   pigeonId: string,
//   data: any,
//   files: any,
//   user: any
// ): Promise<IPigeon> => {
//   if (!pigeonId) throw new ApiError(StatusCodes.BAD_REQUEST, "Pigeon ID is required");
//   if (!data) throw new ApiError(StatusCodes.BAD_REQUEST, "Data field is required");

//   // Fetch existing pigeon
//   const pigeon = await Pigeon.findById(pigeonId);
//   if (!pigeon) throw new ApiError(StatusCodes.NOT_FOUND, "Pigeon not found");

//   // Parse JSON string if needed
//   let parsedData: any = data;
//   if (typeof data === "string") {
//     try {
//       parsedData = JSON.parse(data);
//     } catch (err) {
//       throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid JSON data");
//     }
//   }

//   // Admin/SuperAdmin check for special fields
//   if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
//     delete parsedData.verified;
//     delete parsedData.iconic;
//     delete parsedData.iconicScore;
//   }

//   // Convert numeric fields
//   ["birthYear", "racerRating", "breederRating", "racingRating"].forEach(field => {
//     if (parsedData[field] !== undefined) parsedData[field] = Number(parsedData[field]);
//   });

//   // Update fatherRingId
//   if (parsedData.fatherRingId && parsedData.fatherRingId.trim() !== "") {
//     const father = await Pigeon.findOne({ ringNumber: parsedData.fatherRingId });
//     if (!father) throw new ApiError(StatusCodes.BAD_REQUEST, "Father pigeon not found");
//     parsedData.fatherRingId = father._id;
//   } else {
//     parsedData.fatherRingId = null; // allow clearing
//   }

//   // Update motherRingId
//   if (parsedData.motherRingId && parsedData.motherRingId.trim() !== "") {
//     const mother = await Pigeon.findOne({ ringNumber: parsedData.motherRingId });
//     if (!mother) throw new ApiError(StatusCodes.BAD_REQUEST, "Mother pigeon not found");
//     parsedData.motherRingId = mother._id;
//   } else {
//     parsedData.motherRingId = null; // allow clearing
//   }

//  // --- Handle photos ---
// let currentPhotos: string[] = pigeon.photos || []; // DB-তে পুরানো ছবি
// let newPhotos: string[] = [];
// let remainingPhotos: string[] = parsedData.remaining || [];

// // যদি নতুন ফাইল থাকে
// if (files && Object.keys(files).length > 0) {
//   const filesArray: Express.Multer.File[] = Object.values(files).flat() as Express.Multer.File[];
//   newPhotos = filesArray.map(file => `/images/${file.filename}`);
// }

// // আগেরগুলো থেকে শুধুমাত্র remaining গুলো রেখে দিচ্ছি
// let updatedPhotos = currentPhotos.filter(photo => remainingPhotos.includes(photo));

// // নতুন ছবি যোগ করছি
// updatedPhotos.push(...newPhotos);

// // Duplicate remove
// updatedPhotos = Array.from(new Set(updatedPhotos));

// // At least one image থাকতে হবে
// if (updatedPhotos.length === 0) {
//   throw new ApiError(StatusCodes.BAD_REQUEST, "At least one image is required");
// }

// parsedData.photos = updatedPhotos;


//   // Merge payload with existing pigeon data
//   const payload: Partial<IPigeon> = {
//     ...pigeon.toObject(), // Start from existing data
//     ...parsedData,        // Overwrite with new data
//   };

//   // Update DB
//   const updatedPigeon = await Pigeon.findByIdAndUpdate(pigeonId, payload, {
//     new: true,
//   });

//   if (!updatedPigeon) throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update pigeon");

//   // Notification
// const sender = await User.findById(user._id).select("name");
// if (user.role === "USER") {
//   // সাধারণ USER update করলে শুধু Admin পাবে
//   const admins = await User.find({ role: "ADMIN" }).select("_id name");
//   for (const admin of admins) {
//     await NotificationService.createNotificationToDB({
//       text: `Pigeon updated by ${sender?.name || "Unknown User"}`,
//       type: "ADMIN",
//       receiver: admin._id,
//       referenceId: pigeon._id.toString(),
//       read: false,
//     });
//   }
// } else if (user.role === "ADMIN") {
//   // Admin update করলে সব USER এবং PAIDUSER পাবে
//   const users = await User.find({ role: { $in: ["USER", "PAIDUSER"] } }).select("_id name role");
//   for (const u of users) {
//     await NotificationService.createNotificationToDB({
//       text: `Pigeon updated by ${sender?.name || "Admin"}`,
//       type: u.role as "USER" | "PAIDUSER",
//       receiver: u._id,
//       referenceId: pigeon._id.toString(),
//       read: false,
//     });
//   }
// }


//   return updatedPigeon;
// };


// Get All Pigeons




// const updatePigeonToDB = async (
//   pigeonId: string,
//   data: any,
//   files: any,
//   user: any
// ): Promise<IPigeon> => {
//   if (!pigeonId) throw new ApiError(StatusCodes.BAD_REQUEST, "Pigeon ID is required");
//   if (!data) throw new ApiError(StatusCodes.BAD_REQUEST, "Data field is required");

//   // Fetch existing pigeon
//   const pigeon = await Pigeon.findById(pigeonId);
//   if (!pigeon) throw new ApiError(StatusCodes.NOT_FOUND, "Pigeon not found");

//   // Parse JSON string if needed
//   let parsedData: any = data;
//   if (typeof data === "string") {
//     try {
//       parsedData = JSON.parse(data);
//     } catch (err) {
//       throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid JSON data");
//     }
//   }

//   // Admin/SuperAdmin check for special fields
//   if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
//     delete parsedData.verified;
//     delete parsedData.iconic;
//     delete parsedData.iconicScore;
//   }

//   // Convert numeric fields
//   ["birthYear", "racerRating", "breederRating", "racingRating"].forEach(field => {
//     if (parsedData[field] !== undefined) parsedData[field] = Number(parsedData[field]);
//   });

//   // Update fatherRingId
//   if (parsedData.fatherRingId && parsedData.fatherRingId.trim() !== "") {
//     const father = await Pigeon.findOne({ ringNumber: parsedData.fatherRingId });
//     if (!father) throw new ApiError(StatusCodes.BAD_REQUEST, "Father pigeon not found");
//     parsedData.fatherRingId = father._id;
//   } else if (parsedData.fatherRingId === "") {
//     parsedData.fatherRingId = null;
//   }

//   // Update motherRingId
//   if (parsedData.motherRingId && parsedData.motherRingId.trim() !== "") {
//     const mother = await Pigeon.findOne({ ringNumber: parsedData.motherRingId });
//     if (!mother) throw new ApiError(StatusCodes.BAD_REQUEST, "Mother pigeon not found");
//     parsedData.motherRingId = mother._id;
//   } else if (parsedData.motherRingId === "") {
//     parsedData.motherRingId = null;
//   }

//   // --- Handle individual photo fields ---
//   const individualPhotoFields = ["pigeonPhoto", "eyePhoto", "ownershipPhoto", "pedigreePhoto", "DNAPhoto"];
//   individualPhotoFields.forEach(field => {
//     if (files && files[field] && files[field][0]) {
//       parsedData[field] = `/images/${files[field][0].filename}`;
//     }
//   });

//   // --- Handle extra photos array ---
//   let currentPhotos: string[] = pigeon.photos || [];
//   let newPhotos: string[] = [];
//   const remainingPhotos: string[] = parsedData.remaining || [];

//   if (files && files.photos) {
//     const filesArray: Express.Multer.File[] = files.photos;
//     newPhotos = filesArray.map(file => `/images/${file.filename}`);
//   }

//   // Filter old photos based on remaining
//   let updatedPhotos = currentPhotos.filter(photo => remainingPhotos.includes(photo));
//   updatedPhotos.push(...newPhotos);

//   // Remove duplicates
//   updatedPhotos = Array.from(new Set(updatedPhotos));
//   parsedData.photos = updatedPhotos;

//   // Merge payload with existing pigeon data
//   const payload: Partial<IPigeon> = {
//     ...pigeon.toObject(),
//     ...parsedData,
//   };

//   // Update DB
//   const updatedPigeon = await Pigeon.findByIdAndUpdate(pigeonId, payload, { new: true });
//   if (!updatedPigeon) throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update pigeon");




//   return updatedPigeon;
// };


const updatePigeonToDB = async (
  pigeonId: string,
  data: any,
  files: any,
  user: any
): Promise<IPigeon> => {
  if (!pigeonId) throw new ApiError(StatusCodes.BAD_REQUEST, "Pigeon ID is required");
  if (!data) throw new ApiError(StatusCodes.BAD_REQUEST, "Data field is required");
  if (!user?._id) throw new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated");

  // Fetch existing pigeon
  const pigeon = await Pigeon.findById(pigeonId);
  if (!pigeon) throw new ApiError(StatusCodes.NOT_FOUND, "Pigeon not found");

  // Parse JSON string if needed
  let parsedData: any = typeof data === "string" ? JSON.parse(data) : { ...data };

  // --- Free user restrictions (non-admin cannot modify these) ---
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    parsedData.verified = false;
    parsedData.iconic = false;
    parsedData.iconicScore = 0;
  }

  // --- Numeric conversion ---
  ["birthYear", "racerRating", "breederRating", "racingRating"].forEach(field => {
    if (parsedData[field] !== undefined) parsedData[field] = Number(parsedData[field]);
  });

  // --- Father logic (auto-create if missing) ---
  if (parsedData.fatherRingId && parsedData.fatherRingId.trim() !== "") {
    let father = await Pigeon.findOne({ ringNumber: parsedData.fatherRingId });
    if (!father) {
      father = await Pigeon.create({
        ringNumber: parsedData.fatherRingId,
        verified: false,
        user: user._id,
      });
    }
    parsedData.fatherRingId = father._id;
  } else {
    parsedData.fatherRingId = null;
  }

  // --- Mother logic (auto-create if missing) ---
  if (parsedData.motherRingId && parsedData.motherRingId.trim() !== "") {
    let mother = await Pigeon.findOne({ ringNumber: parsedData.motherRingId });
    if (!mother) {
      mother = await Pigeon.create({
        ringNumber: parsedData.motherRingId,
        verified: false,
        user: user._id,
      });
    }
    parsedData.motherRingId = mother._id;
  } else {
    parsedData.motherRingId = null;
  }

  // --- Breeder logic (same as create) ---
  if (parsedData.breeder && parsedData.breeder.trim() !== "") {
    let existingBreeder = await Breeder.findOne({ breederName: parsedData.breeder });
    if (existingBreeder) parsedData.breeder = existingBreeder._id;
    else {
      const newBreeder = await Breeder.create({
        loftName: parsedData.breeder,
        breederName: parsedData.breeder,
        status: false,
        experience: "none",
        country: parsedData.country || "Unknown",
      });
      parsedData.breeder = newBreeder._id;
    }
  } else {
    parsedData.breeder = null;
  }

  // --- Individual photos (overwrite if new uploaded) ---
  const photoFields = ["pigeonPhoto", "eyePhoto", "ownershipPhoto", "pedigreePhoto", "DNAPhoto"];
  photoFields.forEach(field => {
    if (files && files[field] && files[field][0]) {
      parsedData[field] = `/images/${files[field][0].filename}`;
    }
  });

  // --- Extra photos ---
  let updatedPhotos: string[] = pigeon.photos || [];
  const remainingPhotos: string[] = parsedData.remaining || [];

  if (remainingPhotos.length > 0) {
    updatedPhotos = updatedPhotos.filter(photo => remainingPhotos.includes(photo));
  }

  if (files && files.photos) {
    const newPhotos = files.photos.map((file: Express.Multer.File) => `/images/${file.filename}`);
    updatedPhotos.push(...newPhotos);
  }

  parsedData.photos = Array.from(new Set(updatedPhotos));

  // --- Optional results ---
  if (!parsedData.results) parsedData.results = [];
  else if (typeof parsedData.results === "string") {
    try {
      parsedData.results = JSON.parse(parsedData.results);
      if (!Array.isArray(parsedData.results)) parsedData.results = [];
    } catch {
      parsedData.results = [];
    }
  }

  // --- Merge existing pigeon with new data ---
  const payload: Partial<IPigeon> = {
    ...pigeon.toObject(),
    ...parsedData,
  };

  // --- Update database ---
  const updatedPigeon = await Pigeon.findByIdAndUpdate(pigeonId, payload, { new: true });
  if (!updatedPigeon) throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update pigeon");

  return updatedPigeon;
};


const getAllPigeonsFromDB = async (
  query: any
): Promise<{ data: IPigeon[]; pagination: any }> => {
  let baseQuery = Pigeon.find({ status: { $ne: "Deleted" },
    verified: true 
    
   });

  const qb = new QueryBuilder<IPigeon>(baseQuery, query);

  qb.search(["ringNumber", "name", "country",])
    .filter();
     // Step 3: Explicit status filter
  if (query.status) {
    qb.modelQuery = qb.modelQuery.where({
      status: new RegExp(`^${query.status}$`, "i") // case-insensitive exact match
    });
  }

      qb.sort()
    .paginate()
    .fields()
    .populate(["user", "fatherRingId", "motherRingId", "breeder"], {
      user: "name email",
      fatherRingId: "ringNumber name",
      motherRingId: "ringNumber name",
      breeder: "breederName"
    });

  // Execute query
  const dataRaw = await qb.modelQuery.lean();

  // Safe type assertion through unknown
  const data: IPigeon[] = dataRaw as unknown as IPigeon[];

  const pagination = await qb.getPaginationInfo();

  return { pagination ,data  };
};


const getAllPigeonsAdminsFromDB = async (
  query: any
): Promise<{ data: IPigeon[]; pagination: any }> => {
  let baseQuery = Pigeon.find({ status: { $ne: "Deleted" },
    name: { $exists: true, $ne: "" }
   });

  const qb = new QueryBuilder<IPigeon>(baseQuery, query);

  qb.search(["ringNumber", "name", "country",])
    .filter();
     // Step 3: Explicit status filter
  if (query.status) {
    qb.modelQuery = qb.modelQuery.where({
      status: new RegExp(`^${query.status}$`, "i") // case-insensitive exact match
    });
  }

      qb.sort()
    .paginate()
    .fields()
    .populate(["user", "fatherRingId", "motherRingId", "breeder"], {
      user: "name email",
      fatherRingId: "ringNumber name",
      motherRingId: "ringNumber name",
      breeder: "breederName"
    });

  // Execute query
  const dataRaw = await qb.modelQuery.lean();

  // Safe type assertion through unknown
  const data: IPigeon[] = dataRaw as unknown as IPigeon[];

  const pagination = await qb.getPaginationInfo();

  return { pagination ,data  };
};


// const getAllPigeonsFromDB = async (
//   query: any
// ): Promise<{ data: IPigeon[]; pagination: any }> => {
//   let baseQuery = Pigeon.find({ status: { $ne: "Deleted" } });

//   const qb = new QueryBuilder<IPigeon>(baseQuery, query);

//   qb.search(["ringNumber", "name", "country", "breeder"])
//     .filter();

//   // Explicit status filter
//   if (query.status) {
//     qb.modelQuery = qb.modelQuery.where({
//       status: new RegExp(`^${query.status}$`, "i") // case-insensitive exact match
//     });
//   }

//   qb.sort()
//     .paginate()
//     .fields()
//     .populate([
//       "user",
//       "fatherRingId",
//       "motherRingId",
//       "breeder" // <-- breeder add করা হলো
//     ], {
//       user: "name email",
//       fatherRingId: "ringNumber name",
//       motherRingId: "ringNumber name",
//       breeder: "name" // <-- breeder থেকে শুধু name দেখাবে
//     });

//   // Execute query
//   const dataRaw = await qb.modelQuery.lean();

//   // Safe type assertion
//   const data: IPigeon[] = dataRaw as unknown as IPigeon[];

//   const pagination = await qb.getPaginationInfo();

//   return { pagination, data };
// };


// Get Single Pigeon Details

const getPigeonDetailsFromDB = async (id: string): Promise<IPigeon | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID");
  }

  const result = await Pigeon.findById(id)
    .populate("user")
    .populate("fatherRingId")
    .populate("motherRingId")
    .populate("breeder")
    ;

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Pigeon not found");
  }

  return result;
};

const getMyAllPigeonDetailsFromDB = async (
  userId: string,
  query: any
): Promise<{ data: any[]; pagination: any }> => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;

  // Step 1: User own pigeons
  const baseQuery = Pigeon.find({ user: userId, status: { $ne: "Deleted" } ,name: { $exists: true, $ne: "" } });
  const qb = new QueryBuilder<IPigeon>(baseQuery, query);

  qb.search(["ringNumber", "name", "country"]).filter();

  if (query.status) {
    qb.modelQuery = qb.modelQuery.where({
      status: new RegExp(`^${query.status}$`, "i"),
    });
  }

  qb.sort()
    .fields()
    .populate(["user", "fatherRingId", "motherRingId", "breeder"], {
      user: "name email",
      fatherRingId: "ringNumber name",
      motherRingId: "ringNumber name",
      breeder: "breederName",
    });

  const ownPigeons = await qb.modelQuery.lean();

  // Step 2: UserLoft pigeons
  const userLoftDocs = await UserLoft.find({ user: userId })
    .populate({
      path: "pigeon",
      populate: [
        { path: "user", select: "name email" },
        { path: "fatherRingId", select: "ringNumber name" },
        { path: "motherRingId", select: "ringNumber name" },
        { path: "breeder", select: "breederName" },
      ],
    })
    .lean();

  const loftPigeons = userLoftDocs
    .filter(doc => doc.pigeon)
    .map(doc => ({
      ...(doc.pigeon as any),
      loftInfo: { addedAt: doc.addedAt },
    }));

  // Step 3: Combine both
  let allPigeons: any[] = [...ownPigeons, ...loftPigeons];

  // Step 4: Manual search
  if (query.search) {
    const search = query.search.toLowerCase();
    allPigeons = allPigeons.filter(p =>
      ["ringNumber", "name", "country"].some(key =>
        (p as any)[key]?.toString().toLowerCase().includes(search)
      )
    );
  }

  // Step 5: Manual sort
  if (query.sortBy && query.order) {
    allPigeons.sort((a, b) => {
      const fieldA = (a as any)[query.sortBy];
      const fieldB = (b as any)[query.sortBy];
      if (!fieldA || !fieldB) return 0;
      if (query.order === "asc") return fieldA > fieldB ? 1 : -1;
      return fieldA < fieldB ? 1 : -1;
    });
  }

  // Step 6: Pagination
  const total = allPigeons.length;
  const totalPage = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = allPigeons.slice(start, end);

  const pagination = { total, limit, page, totalPage };

  return { pagination, data: paginatedData };
};



// Delete Pigeon (soft delete: set status = "Deleted")

const deletePigeonFromDB = async (id: string, user: any): Promise<any> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID");
  }

  const pigeon = await Pigeon.findById(id);
  if (!pigeon) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Pigeon not found");
  }

  if (["USER", "PAIDUSER"].includes(user.role)) {
  // Check if pigeon is in UserLoft of current user
  const userLoftEntry = await UserLoft.findOne({ user: user._id, pigeon: id });
  const loftEntry = await Loft.findOne({ _id: id, breeder: user._id });

  if (userLoftEntry) {
    await UserLoft.deleteOne({ _id: userLoftEntry._id });
  }

  if (loftEntry) {
    await Loft.deleteOne({ _id: loftEntry._id });
  }

  // যদি pigeon main DB এ current user এর own pigeon হয় → main DB থেকে delete
  if (!userLoftEntry && !loftEntry) {
    if (!pigeon.user.equals(user._id)) {
      throw new ApiError(StatusCodes.FORBIDDEN, "You can only delete your own pigeons");
    }
    await Pigeon.findByIdAndDelete(id);
    return { message: "Pigeon deleted successfully" };
  }

  return { message: "Pigeon removed from UserLoft/Loft, main pigeon not deleted" };
}


  // ADMIN / SUPER_ADMIN → সব delete করতে পারবে
  await Pigeon.findByIdAndDelete(id);
  await UserLoft.deleteMany({ pigeon: id });
  await Loft.deleteMany({ _id: id });

  return { message: "Pigeon deleted successfully for all references" };
};


// Get Pigeon with family members (parents) up to a certain depth
const getPigeonWithFamily = async (pigeonId: string, maxDepth = 5) => {
  const populateFamily = async (pigeon: any, depth = 0): Promise<any> => {
    if (!pigeon) return pigeon;

    // Always populate current pigeon
    const populatedPigeonRaw = await Pigeon.findById(pigeon._id)
      .populate(["fatherRingId", "motherRingId", "breeder"])
      .lean();

    if (!populatedPigeonRaw) return null;

    const populatedPigeon = populatedPigeonRaw;

    // Recurse only if depth < maxDepth
    if (depth < maxDepth) {
      if (populatedPigeon.fatherRingId) {
        populatedPigeon.fatherRingId = await populateFamily(
          populatedPigeon.fatherRingId,
          depth + 1
        );
      }
      if (populatedPigeon.motherRingId) {
        populatedPigeon.motherRingId = await populateFamily(
          populatedPigeon.motherRingId,
          depth + 1
        );
      }
    }

    return populatedPigeon;
  };

  const pigeon = await Pigeon.findById(pigeonId);
  if (!pigeon) throw new ApiError(StatusCodes.NOT_FOUND, "Pigeon not found");

  const fullFamily = await populateFamily(pigeon);
  return fullFamily;
};

// const getPigeonWithFamily = async (pigeonId: string, maxDepth = 5) => {
//   const allPigeons = await Pigeon.find({})
//     .select("")
//     .lean();

//   const pigeonMap = new Map<string, any>();
//   allPigeons.forEach((p) => pigeonMap.set(p._id.toString(), p));

//   const buildFamily = (pigeon: any, depth = 0): any => {
//     if (!pigeon || depth >= maxDepth) return pigeon;

//     const father = pigeon.fatherRingId
//       ? buildFamily(pigeonMap.get(pigeon.fatherRingId.toString()), depth + 1)
//       : null;
//     const mother = pigeon.motherRingId
//       ? buildFamily(pigeonMap.get(pigeon.motherRingId.toString()), depth + 1)
//       : null;

//     return { ...pigeon, fatherRingId: father, motherRingId: mother };
//   };

//   const basePigeon = pigeonMap.get(pigeonId);
//   return buildFamily(basePigeon);
// };

// const getSiblings = async (pigeonId: string) => {
//   // Step 1: Find the pigeon
//   const pigeon = await Pigeon.findById(pigeonId);
//   if (!pigeon) throw new ApiError(StatusCodes.NOT_FOUND, "Pigeon not found");

//   const fatherId = pigeon.fatherRingId;
//   const motherId = pigeon.motherRingId;

//   // Step 2: Full siblings (same father & same mother)
//   const fullSiblings = await Pigeon.find({
//     _id: { $ne: pigeon._id },
//     fatherRingId: fatherId,
//     motherRingId: motherId,
//   }).sort({ createdAt: -1 }) // latest first
//     .limit(5)
//     .lean();

//   // Step 3: Half-siblings (same father OR same mother, but not both)
//   const halfSiblings = await Pigeon.find({
//     _id: { $ne: pigeon._id },
//     $or: [
//       { fatherRingId: fatherId, motherRingId: { $ne: motherId } },
//       { motherRingId: motherId, fatherRingId: { $ne: fatherId } },
//     ],
//   }).sort({ createdAt: -1 }) // latest first
//     .limit(5)
//     .lean();

//   return {
//     pigeon,
//     fullSiblings,
//     halfSiblings,
//   };
// };

const getSiblings = async (pigeonId: string) => {
  // ১. মূল পায়জান বের করা
  const pigeon = await Pigeon.findById(pigeonId).lean();
  if (!pigeon) throw new ApiError(StatusCodes.NOT_FOUND, "Pigeon not found");

  const fatherId = pigeon.fatherRingId?.toString();
  const motherId = pigeon.motherRingId?.toString();

  // ২. Full siblings (একই বাবা & একই মা)
  let fullSiblings: any[] = [];
  if (fatherId && motherId) {
    fullSiblings = await Pigeon.find({
      _id: { $ne: pigeon._id },
      fatherRingId: fatherId,
      motherRingId: motherId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
  }

  // ৩. Half siblings (একই বাবা অথবা একই মা, কিন্তু দুইটা একসাথে নয়)
  let halfSiblings: any[] = [];
  const halfOrConditions = [];
  if (fatherId && motherId) {
    halfOrConditions.push(
      { fatherRingId: fatherId, motherRingId: { $ne: motherId } },
      { motherRingId: motherId, fatherRingId: { $ne: fatherId } }
    );
  } else if (fatherId) {
    halfOrConditions.push({ fatherRingId: fatherId });
  } else if (motherId) {
    halfOrConditions.push({ motherRingId: motherId });
  }

  if (halfOrConditions.length > 0) {
    halfSiblings = await Pigeon.find({
      _id: { $ne: pigeon._id },
      $or: halfOrConditions,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
  }

  // ৪. Type add করা
  const siblings = [
    ...fullSiblings.map((s) => ({ ...s, type: "Full Sibling" })),
    ...halfSiblings.map((s) => ({ ...s, type: "Half Sibling" })),
  ];

  return siblings;
};





// Import pigeons from Excel file
const importFromExcel = async (filePath: string, user: any) => {
  // Free user check
  if (user.role === "USER") {
    const currentCount = await Pigeon.countDocuments({ user: user._id });
    if (currentCount >= 50) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Free users can only add up to 50 pigeons"
      );
    }
  }

  // Read Excel
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const pigeonsToInsert: any[] = [];

  for (const row of rows) {
    const {
      ringNumber,
      name,
      country,
      birthYear,
      shortInfo,
      breeder,
      color,
      pattern,
      racherRating,
      breederRating,
      gender,
      status,
      location,
      racingRating,
      notes,
      results,
      fatherRingId,
      motherRingId,
      photos,
    }: any = row;

    if (!ringNumber) continue; // skip empty

    const pigeonData: any = {
      ringNumber,
      name,
      country,
      birthYear,
      shortInfo,
      breeder,
      color,
      pattern,
      racherRating,
      breederRating,
      gender,
      status,
      location,
      racingRating,
      notes,
      results,
    };

    // Validate father/mother
    if (fatherRingId) {
      const father = await Pigeon.findOne({ ringNumber: fatherRingId });
      if (!father)
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Father ${fatherRingId} not found`
        );
      pigeonData.fatherRingId = father._id;
    }
    if (motherRingId) {
      const mother = await Pigeon.findOne({ ringNumber: motherRingId });
      if (!mother)
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Mother ${motherRingId} not found`
        );
      pigeonData.motherRingId = mother._id;
    }

    // Parse photos (comma or semicolon separated)
    if (photos && typeof photos === "string") {
      pigeonData.photos = photos
        .split(/[,;]+/)
        .map((p: string) => p.trim())
        .filter(Boolean);
    } else {
      pigeonData.photos = [];
    }

    // Attach user
    pigeonData.user = user._id;

    pigeonsToInsert.push(pigeonData);
  }

  // Insert into DB
  const inserted = await Pigeon.insertMany(pigeonsToInsert);
  return inserted;
};

// Export pigeons to PDF

const exportToPDF = async (query: any): Promise<Buffer> => {
  // Step 1: Base query (Deleted pigeons skip)
  let baseQuery = Pigeon.find({ status: { $ne: "Deleted" } });

  // Step 2: Apply search, filter, sort, pagination
  const qb = new QueryBuilder<IPigeon>(baseQuery, query);
  qb.search(["ringNumber", "name", "country", ])
    .filter()
    .sort()
    .paginate() // page & limit support
    .fields()
    .populate(["user", "fatherRingId", "motherRingId"], {
      user: "name email",
      fatherRingId: "ringNumber name",
      motherRingId: "ringNumber name",
    });

  // Step 3: Execute query (plain objects)
  const pigeonsRaw = await qb.modelQuery.lean();
  const pigeons: IPigeon[] = pigeonsRaw as unknown as IPigeon[];

  if (!pigeons.length) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "No pigeons found for this filter/page"
    );
  }

  // Step 4: Generate PDF
  const pdfBuffer = await pdfDoc(pigeons); // pdfDoc helper
  return pdfBuffer;
};

// Get My Pigeons with filter/pagination
const getMyPigeonsFromDB = async (
  user: any,
  query: any
): Promise<{ data: IPigeon[]; pagination: any }> => {
  if (!user || !user._id) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated");
  }

  // Step 1: Base query (only this user's pigeons, Deleted skip)
  let baseQuery = Pigeon.find({
    user: user._id,
    status: { $ne: "Deleted" },
  });

  const qb = new QueryBuilder<IPigeon>(baseQuery, query);

  qb.search(["ringNumber", "name", "country", ])
    .filter()
    .sort()
    .paginate()
    .fields()
    .populate(["fatherRingId", "motherRingId","breeder"], {});

  const dataRaw = await qb.modelQuery.lean();
  const data: IPigeon[] = dataRaw as unknown as IPigeon[];
  const pagination = await qb.getPaginationInfo();

  return { data, pagination };
};







const searchPigeonsByNameFromDB = async (query: string) => {
  const pigeons = await Pigeon.find({
    $and: [
      { status: { $ne: "Deleted" } },
      { $or: [{ verified: true }, { iconic: true }] },
      {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { ringNumber: { $regex: query, $options: "i" } }
        ]
      }
    ]
  }).select("_id name ringNumber");

  return pigeons;
};
const searchAllPigeonsByNameFromDB = async (query: string) => {
  const pigeons = await Pigeon.find({
    $and: [
      { status: { $ne: "Deleted" } },
      // { $or: [{ verified: true }, { iconic: true }] },
      {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { ringNumber: { $regex: query, $options: "i" } }
        ]
      }
    ]
  }).select("_id name ringNumber");

  return pigeons;
};



const togglePigeonStatusInDB = async (pigeonId: string) => {
  const pigeon = await Pigeon.findById(pigeonId);
  if (!pigeon) throw new ApiError(StatusCodes.NOT_FOUND, "Pigeon not found");

  // Toggle status
  pigeon.status = pigeon.status === "active" ? "inactive" : "active";
  await pigeon.save();

  return {
    id: pigeon._id.toString(),
    status: pigeon.status,
  };
};

export const PigeonService = {
  createPigeonToDB,
  updatePigeonToDB,
  getAllPigeonsFromDB,
  getAllPigeonsAdminsFromDB,
  getPigeonDetailsFromDB,
  deletePigeonFromDB,
  getPigeonWithFamily,
  getSiblings,
  importFromExcel,
  exportToPDF,
  getMyPigeonsFromDB,
  searchPigeonsByNameFromDB,
  searchAllPigeonsByNameFromDB,
  getMyAllPigeonDetailsFromDB,
  togglePigeonStatusInDB
};