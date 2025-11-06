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
const pigeonCountMap = new Map<string, number>();

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

  // 🔹 API level trimming
if (parsedData.ringNumber) parsedData.ringNumber = parsedData.ringNumber.trim();
if (parsedData.name) parsedData.name = parsedData.name.trim();
if (parsedData.fatherRingId) parsedData.fatherRingId = parsedData.fatherRingId.trim();
if (parsedData.motherRingId) parsedData.motherRingId = parsedData.motherRingId.trim();
if (parsedData.breeder) parsedData.breeder = parsedData.breeder.trim();




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
// 🕊 Father ring logic with gender + ownership + verified check
if (parsedData.fatherRingId && parsedData.fatherRingId.trim() !== "") {
  const fatherRing = parsedData.fatherRingId.trim();

  if (fatherRing === parsedData.ringNumber) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "A pigeon cannot be its own father.");
  }

  let father = await Pigeon.findOne({ ringNumber: fatherRing });
  console.log("Father pigeon found:", father);

  if (father) {
    // 🔹 Gender check
    if (father.gender?.toLowerCase() !== "cock") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Father pigeon must be a cock. The provided ring number belongs to a hen."
      );
    }

    // 🔹 Ownership + verified logic
    const isOwnPigeon = father.user.toString() === user._id.toString();
    if (!isOwnPigeon && !father.verified) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "You can only assign another user's pigeon as father if it is verified."
      );
    }
  } else {
    // 🆕 DB-তে না থাকলে নতুন তৈরি
    father = await Pigeon.create({
      ringNumber: fatherRing,
      verified: false,
      user: user._id,
    });
  }

  parsedData.fatherRingId = father._id;
} else {
  parsedData.fatherRingId = null;
}

// 🕊 Mother ring logic with gender + ownership + verified check
if (parsedData.motherRingId && parsedData.motherRingId.trim() !== "") {
  const motherRing = parsedData.motherRingId.trim();

  if (motherRing === parsedData.ringNumber) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "A pigeon cannot be its own mother.");
  }

  let mother = await Pigeon.findOne({ ringNumber: motherRing });

  if (mother) {
    // 🔹 Gender check
    if (mother.gender?.toLowerCase() !== "hen") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Mother pigeon must be a hen. The provided ring number belongs to a cock."
      );
    }

    // 🔹 Ownership + verified logic
    const isOwnPigeon = mother.user.toString() === user._id.toString();
    if (!isOwnPigeon && !mother.verified) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "You can only assign another user's pigeon as mother if it is verified."
      );
    }
  } else {
    // 🆕 DB-তে না থাকলে নতুন তৈরি
    mother = await Pigeon.create({
      ringNumber: motherRing,
      verified: false,
      user: user._id,
    });
  }

  parsedData.motherRingId = mother._id;
} else {
  parsedData.motherRingId = null;
}




// console.log("Incoming data:", data);
// console.log("Parsed data before breeder:", parsedData);



//    // Breeder logic
// if (parsedData.breeder && parsedData.breeder.trim() !== "") {
//   console.log("Breeder empty or undefined, deleting key");
//   let existingBreeder = await Breeder.findOne({ breederName: parsedData.breeder });
//   if (existingBreeder) parsedData.breeder = existingBreeder._id;
//   else {
//     const newBreeder = await Breeder.create({
//       loftName: parsedData.breeder,
//       breederName: parsedData.breeder,
//       status: false,
//       experience: "none",
//       country: parsedData.country || "Unknown",
//     });
//     parsedData.breeder = newBreeder._id;
//   }
// } else {
//   // console.log("Breeder exists:", parsedData.breeder);
//   parsedData.breeder = null; // null নয়, undefined পাঠান
// }




if (parsedData.breeder) {
  parsedData.breeder = parsedData.breeder.trim();

  if (parsedData.breeder !== "") {
    // Check if breeder (loftName) already exists
    let existingBreeder = await Breeder.findOne({
      loftName: new RegExp(`^${parsedData.breeder}$`, "i"), // case-insensitive match
    });

    if (existingBreeder) {
      // ✅ Use existing breeder _id
      parsedData.breeder = existingBreeder._id;
    } else {
      // 🆕 Create new breeder if not found
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
    parsedData.breeder = null; // empty string
  }
} else {
  parsedData.breeder = null; // undefined
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

// console.log("verifiedExist:", verifiedExist);



  if (verifiedExist) {
    // Loft create instead of pigeon
    // Check verified pigeon with same ringNumber
// const ringExist = await Pigeon.findOne({ ringNumber: parsedData.ringNumber, verified: true });
// if (ringExist) throw new ApiError(StatusCodes.CONFLICT, "This Ring Number belongs to a verified pigeon and cannot be used");
// console.log("ring number", ringExist);

// Check verified pigeon with same name
const nameExist = await Pigeon.findOne({ name: parsedData.name, verified: true });
if (nameExist) throw new ApiError(StatusCodes.CONFLICT, "This name belongs to a verified pigeon and cannot be used");
// console.log("ring number", ringExist);

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




  // 🔍 Duplicate check: same ringNumber + country + birthYear
  if (parsedData.ringNumber && parsedData.country && parsedData.birthYear) {
    const duplicatePigeon = await Pigeon.findOne({
      ringNumber: parsedData.ringNumber,
      country: parsedData.country,
      birthYear: parsedData.birthYear,
    });

    if (duplicatePigeon) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "This pigeon is already registered in our database. To add it to your loft database, go to the Pigeon Database and press the “+” button."
      );
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


  // 🛑 Check if pigeon is iconic -> only ADMIN can edit
  if (pigeon.iconic && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You cannot edit an iconic pigeon.");
  }



  // Parse incoming data
  const parsedData: any = typeof data === "string" ? JSON.parse(data) : { ...data };

  // Free user restrictions
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    parsedData.verified = false;
    parsedData.iconic = false;
    parsedData.iconicScore = 0;
  }

  // Numeric conversion
  ["birthYear", "racerRating", "breederRating", "racingRating"].forEach(field => {
    if (parsedData[field] !== undefined) parsedData[field] = Number(parsedData[field]);
  });

// // Father logic
// if (parsedData.fatherRingId !== undefined) {
//   const newFatherRing = parsedData.fatherRingId?.trim();

//   if (newFatherRing === pigeon.ringNumber) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "You cannot assign the pigeon itself as father.");
//   }

//   if (newFatherRing) {
//     let father = await Pigeon.findOne({ ringNumber: newFatherRing });
//     if (!father) {
//       father = await Pigeon.create({ ringNumber: newFatherRing, verified: false, user: user._id });
//     }
//     parsedData.fatherRingId = father._id;
//   } else {
//     // 🔹 যদি খালি দেওয়া হয়, null করে দেবে
//     parsedData.fatherRingId = null;
//   }
// } else {
//   parsedData.fatherRingId = pigeon.fatherRingId; // ফিল্ড না এলে আগেরটা থাকবে
// }

// // Mother logic
// if (parsedData.motherRingId !== undefined) {
//   const newMotherRing = parsedData.motherRingId?.trim();

//   if (newMotherRing === pigeon.ringNumber) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "You cannot assign the pigeon itself as mother or father.");
//   }

//   if (newMotherRing) {
//     let mother = await Pigeon.findOne({ ringNumber: newMotherRing });
//     if (!mother) {
//       mother = await Pigeon.create({ ringNumber: newMotherRing, verified: false, user: user._id });
//     }
//     parsedData.motherRingId = mother._id;
//   } else {
//     // 🔹 যদি খালি দেওয়া হয়, null করে দেবে
//     parsedData.motherRingId = null;
//   }
// } else {
//   parsedData.motherRingId = pigeon.motherRingId; // ফিল্ড না এলে আগেরটা থাকবে
// }


// 🕊 Father logic
if (parsedData.fatherRingId !== undefined) {
  const newFatherRing = parsedData.fatherRingId?.trim();

  if (newFatherRing === pigeon.ringNumber) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You cannot assign the pigeon itself as father.");
  }

  if (newFatherRing) {
    let father = await Pigeon.findOne({ ringNumber: newFatherRing });

    if (!father) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Father pigeon not found in database.");
    }

    // ✅ Logic: user can use own pigeon (any verify status)
    // Others' pigeon must be verified
    const isOwnPigeon = father.user.toString() === user._id.toString();

    if (!isOwnPigeon && !father.verified) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "You can only assign another user's pigeon if it is verified."
      );
    }

    parsedData.fatherRingId = father._id;
  } else {
    parsedData.fatherRingId = null;
  }
} else {
  parsedData.fatherRingId = pigeon.fatherRingId;
}

// 🕊 Mother logic
if (parsedData.motherRingId !== undefined) {
  const newMotherRing = parsedData.motherRingId?.trim();

  if (newMotherRing === pigeon.ringNumber) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You cannot assign the pigeon itself as mother or father.");
  }

  if (newMotherRing) {
    let mother = await Pigeon.findOne({ ringNumber: newMotherRing });

    if (!mother) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Mother pigeon not found in database.");
    }

    // ✅ Logic: user can use own pigeon (any verify status)
    // Others' pigeon must be verified
    const isOwnPigeon = mother.user.toString() === user._id.toString();

    if (!isOwnPigeon && !mother.verified) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "You can only assign another user's pigeon if it is verified."
      );
    }

    parsedData.motherRingId = mother._id;
  } else {
    parsedData.motherRingId = null;
  }
} else {
  parsedData.motherRingId = pigeon.motherRingId;
}




 // 🔹 Breeder logic (update time)
if (parsedData.breeder !== undefined) {
  parsedData.breeder = parsedData.breeder.trim();

  if (parsedData.breeder !== "") {
    // Case-insensitive match for existing breeder
    let existingBreeder = await Breeder.findOne({
      loftName: new RegExp(`^${parsedData.breeder}$`, "i"),
    });

    if (existingBreeder) {
      // ✅ Use existing breeder _id
      parsedData.breeder = existingBreeder._id;
    } else {
      // 🆕 Create new breeder if not found
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
    // breeder ফিল্ড খালি থাকলে null
    parsedData.breeder = null;
  }
} else {
  // breeder ফিল্ড না থাকলে পুরনো breeder রাখবে
  parsedData.breeder = pigeon.breeder;
}


  // Verified pigeon conflict check
  const verifiedExist = await Pigeon.findOne({
    $or: [{ ringNumber: parsedData.ringNumber }, { name: parsedData.name }],
    verified: true,
    _id: { $ne: pigeonId },
  });
  if (verifiedExist && verifiedExist.name === parsedData.name && pigeon.name !== parsedData.name) {
    throw new ApiError(StatusCodes.CONFLICT, "This name belongs to a verified pigeon and cannot be used");
  }

  // Duplicate check: same ringNumber + country + birthYear
  if (parsedData.ringNumber && parsedData.country && parsedData.birthYear) {
    const originalUnchanged =
      pigeon.ringNumber === parsedData.ringNumber &&
      pigeon.country === parsedData.country &&
      pigeon.birthYear === parsedData.birthYear;

    if (!originalUnchanged) {
      const duplicatePigeon = await Pigeon.findOne({
        ringNumber: parsedData.ringNumber,
        country: parsedData.country,
        birthYear: parsedData.birthYear,
        _id: { $ne: pigeonId },
      });
      if (duplicatePigeon) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          "This pigeon is already registered in our database. To add it to your loft database, go to the Pigeon Database and press the “+” button."
        );
      }
    }
  }

  // Handle photos
  const photoFields: (keyof IPigeon)[] = ["pigeonPhoto", "eyePhoto", "ownershipPhoto", "pedigreePhoto", "DNAPhoto"];
  photoFields.forEach(field => {
    if (files && files[field] && files[field][0]) parsedData[field] = `/images/${files[field][0].filename}`;
    else if (parsedData[field] === undefined) parsedData[field] = pigeon[field]; // আগের value রাখো
  });

  // Extra photos
  let updatedPhotos: string[] = pigeon.photos || [];
  const remainingPhotos: string[] = parsedData.remaining || [];
  if (remainingPhotos.length > 0) updatedPhotos = updatedPhotos.filter(photo => remainingPhotos.includes(photo));
  if (files && files.photos) updatedPhotos.push(...files.photos.map((file: Express.Multer.File) => `/images/${file.filename}`));
  parsedData.photos = Array.from(new Set(updatedPhotos));

  // Optional results
  if (parsedData.results !== undefined) {
    if (typeof parsedData.results === "string") {
      try {
        parsedData.results = JSON.parse(parsedData.results);
        if (!Array.isArray(parsedData.results)) parsedData.results = pigeon.results || [];
      } catch {
        parsedData.results = pigeon.results || [];
      }
    }
  } else parsedData.results = pigeon.results || [];

  // Merge old and new data
  const payload: Partial<IPigeon> = { ...pigeon.toObject(), ...parsedData };

  // Update database
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
      breeder: "loftName breederName status country ",
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
      breeder: "loftName breederName status country ",
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
  .populate({
    path: "fatherRingId",
    populate: {
      path: "breeder",
      select: "loftName breederName status country experience" // যেগুলো দরকার
    }
  })
  .populate({
    path: "motherRingId",
    populate: {
      path: "breeder",
      select: "loftName breederName status country experience"
    }
  })
  .populate({
    path: "breeder",
    select: "loftName breederName status country experience"
  });

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Pigeon not found");
  }

  return result;
};

// const getMyAllPigeonDetailsFromDB = async (
//   userId: string,
//   query: any
// ): Promise<{ data: any[]; pagination: any }> => {

//     console.log("🟢 Function called for user:", userId);
//   console.log("📥 Raw Query Params:", query);
//   const page = parseInt(query.page as string) || 1;
//   const limit = parseInt(query.limit as string) || 10;



 
//   // Step 1: User own pigeons
//   const baseQuery = Pigeon.find({ user: userId, status: { $ne: "Deleted" } ,name: { $exists: true, $ne: "" } });
//   const qb = new QueryBuilder<IPigeon>(baseQuery, query);

//   qb.search(["ringNumber", "name", "country"]).filter();

//   if (query.status) {
//     qb.modelQuery = qb.modelQuery.where({
//       status: new RegExp(`^${query.status}$`, "i"),
//     });
//   }

//   qb.sort()
//     .fields()
//     .populate(["user", "fatherRingId", "motherRingId", "breeder"], {
//       user: "name email",
//       fatherRingId: "ringNumber name",
//       motherRingId: "ringNumber name",
//       breeder: "breederName",
//     });

//      console.log("🧩 Final Mongoose Filter:", qb.modelQuery.getFilter());

//   const ownPigeons = await qb.modelQuery.lean();

//   // Step 2: UserLoft pigeons
//   const userLoftDocs = await UserLoft.find({ user: userId })
//     .populate({
//       path: "pigeon",
//       populate: [
//         { path: "user", select: "name email" },
//         { path: "fatherRingId", select: "ringNumber name" },
//         { path: "motherRingId", select: "ringNumber name" },
//         { path: "breeder", select: "breederName" },
//       ],
//     })
    

//   const loftPigeons = userLoftDocs
//     .filter(doc => doc.pigeon)
//     .map(doc => ({
//       ...(doc.pigeon as any),
//       loftInfo: { addedAt: doc.addedAt },
//     }));

//   // Step 3: Combine both
//   let allPigeons: any[] = [...ownPigeons, ...loftPigeons];

//   // Step 4: Manual search
//   if (query.search) {
//     const search = query.search.toLowerCase();
//     allPigeons = allPigeons.filter(p =>
//       ["ringNumber", "name", "country"].some(key =>
//         (p as any)[key]?.toString().toLowerCase().includes(search)
//       )
//     );
//   }

//   // Step 5: Manual sort
//   if (query.sortBy && query.order) {
//     allPigeons.sort((a, b) => {
//       const fieldA = (a as any)[query.sortBy];
//       const fieldB = (b as any)[query.sortBy];
//       if (!fieldA || !fieldB) return 0;
//       if (query.order === "asc") return fieldA > fieldB ? 1 : -1;
//       return fieldA < fieldB ? 1 : -1;
//     });
//   }

//   // Step 6: Pagination
//   const total = allPigeons.length;
//   const totalPage = Math.ceil(total / limit);
//   const start = (page - 1) * limit;
//   const end = start + limit;
//   const paginatedData = allPigeons.slice(start, end);

//   const pagination = { total, limit, page, totalPage };

//   return { pagination, data: paginatedData };
// };



const getMyAllPigeonDetailsFromDB = async (
  userId: string,
  query: any
): Promise<{ data: any[]; pagination: any }> => {

  // --- Step 1: Fetch full own pigeons ---
  const ownFilter: any = {
    user: userId,
    status: { $ne: "Deleted" },
    name: { $exists: true, $ne: "" },
  };

  if (query.birthYear) ownFilter.birthYear = Number(query.birthYear);
  if (query.gender) ownFilter.gender = new RegExp(`^${query.gender.trim()}$`, "i");
  if (query.country) ownFilter.country = new RegExp(`^${query.country.trim()}$`, "i");
  if (query.status) ownFilter.status = new RegExp(`^${query.status.trim()}$`, "i");
  if (query.catagory) ownFilter.catagory = new RegExp(`^${query.catagory.trim()}$`, "i");

  if (query.breeder) {
    const breederDoc = await Breeder.findOne({ breederName: new RegExp(`^${query.breeder.trim()}$`, "i") });
    if (breederDoc) ownFilter.breeder = breederDoc._id;
  }

  const ownPigeons = await Pigeon.find(ownFilter)
    .populate("user", "name email")
    .populate("fatherRingId", "ringNumber name")
    .populate("motherRingId", "ringNumber name")
    .populate("breeder", "loftName breederName status country")
    .lean();

  // --- Step 2: Fetch full loft pigeons ---
  const loftPigeonIds = await UserLoft.find({ user: userId }).distinct("pigeon");

  const loftFilter: any = {
    _id: { $in: loftPigeonIds },
    status: { $ne: "Deleted" },
  };

  if (query.birthYear) loftFilter.birthYear = Number(query.birthYear);
  if (query.gender) loftFilter.gender = new RegExp(`^${query.gender.trim()}$`, "i");
  if (query.country) loftFilter.country = new RegExp(`^${query.country.trim()}$`, "i");
  if (query.status) loftFilter.status = new RegExp(`^${query.status.trim()}$`, "i");
  if (query.catagory) loftFilter.catagory = new RegExp(`^${query.catagory.trim()}$`, "i");

  if (query.breeder) {
    const breederDoc = await Breeder.findOne({ breederName: new RegExp(`^${query.breeder.trim()}$`, "i") });
    if (breederDoc) loftFilter.breeder = breederDoc._id;
  }

  let loftPigeons = await Pigeon.find(loftFilter)
    .populate("user", "name email")
    .populate("fatherRingId", "ringNumber name")
    .populate("motherRingId", "ringNumber name")
    .populate("breeder", "loftName breederName status country")
    .lean();

  // --- Attach loft info (addedAt) ---
  const loftMap = await UserLoft.find({ user: userId, pigeon: { $in: loftPigeonIds } })
    .select("pigeon addedAt")
    .lean();

  loftPigeons = loftPigeons.map(p => {
    const loftInfo = loftMap.find(l => l.pigeon.toString() === p._id.toString());
    return { ...p, loftInfo: loftInfo ? { addedAt: loftInfo.addedAt } : undefined };
  });

  // --- Step 3: Combine own + loft pigeons ---
  let allPigeons: any[] = [...ownPigeons, ...loftPigeons];

  // --- Step 4: Apply QueryBuilder filters/sorting if any ---
  const qb = new QueryBuilder<IPigeon>(Pigeon.find({ _id: { $in: allPigeons.map(p => p._id) } }), query);
  qb.search(["ringNumber", "name", "country"]).filter().sort().fields().populate(
    ["user", "fatherRingId", "motherRingId", "breeder"],
    {
      user: "name email",
      fatherRingId: "ringNumber name",
      motherRingId: "ringNumber name",
      breeder: "loftName breederName status country",
    }
  );

  let filteredPigeons = await qb.modelQuery;

  // --- Step 5: Apply pagination only if user provides page/limit ---
  let page = query.page ? parseInt(query.page as string) : null;
  let limit = query.limit ? parseInt(query.limit as string) : null;
  let paginatedData = filteredPigeons;

  const total = filteredPigeons.length;
  let totalPage = 1;

  if (page && limit) {
    totalPage = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    paginatedData = filteredPigeons.slice(start, end);
  } else {
    page = 1;
    limit = total;
  }

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
// const getPigeonWithFamily = async (pigeonId: string, maxDepth = 5) => {
//   const populateFamily = async (pigeon: any, depth = 0): Promise<any> => {
//     if (!pigeon) return pigeon;

//     // Always populate current pigeon
//     const populatedPigeonRaw = await Pigeon.findById(pigeon._id)
//       .populate(["fatherRingId", "motherRingId", "breeder"])
//       .lean();

//     if (!populatedPigeonRaw) return null;

//     const populatedPigeon = populatedPigeonRaw;

//     // Recurse only if depth < maxDepth
//     if (depth < maxDepth) {
//       if (populatedPigeon.fatherRingId) {
//         populatedPigeon.fatherRingId = await populateFamily(
//           populatedPigeon.fatherRingId,
//           depth + 1
//         );
//       }
//       if (populatedPigeon.motherRingId) {
//         populatedPigeon.motherRingId = await populateFamily(
//           populatedPigeon.motherRingId,
//           depth + 1
//         );
//       }
//     }

//     return populatedPigeon;
//   };

//   const pigeon = await Pigeon.findById(pigeonId);
//   if (!pigeon) throw new ApiError(StatusCodes.NOT_FOUND, "Pigeon not found");

//   const fullFamily = await populateFamily(pigeon);
//   return fullFamily;
// };


const getPigeonWithFamily = async (pigeonId: string, maxDepth = 5) => {
  const pigeonCountMap = new Map<string, number>();

  const populateFamily = async (pigeon: any, depth = 0): Promise<any> => {
    if (!pigeon) return pigeon;

    const populatedPigeonRaw = await Pigeon.findById(pigeon._id)
      .populate(["fatherRingId", "motherRingId", "breeder"])
      .lean();

    if (!populatedPigeonRaw) return null;

    const populatedPigeon = populatedPigeonRaw;

    // / 🔁 Duplicate count for pedigree
    const idStr = populatedPigeon._id.toString();
    const currentCount = pigeonCountMap.get(idStr) || 0;
    pigeonCountMap.set(idStr, currentCount + 1);

    const isPedigreeSame = pigeonCountMap.get(idStr)! > 1;
    const isVerified = populatedPigeon.verified;
    const isIconic = populatedPigeon.iconic;
    const breederScoreHigh =
      populatedPigeon.iconicScore && populatedPigeon.iconicScore >= 9;

    // 🎨 Color logic
    if (isIconic && isVerified && breederScoreHigh && isPedigreeSame) {
      populatedPigeon.colorField = "#FFFF83"; // Iconic overrides all
    } else if (isIconic && isVerified && breederScoreHigh) {
      populatedPigeon.colorField = "#FFFF83";
    } else if (isIconic && isPedigreeSame && breederScoreHigh) {
      populatedPigeon.colorField = "#FFFF83";
    } else if (isIconic && isPedigreeSame) {
      populatedPigeon.colorField = "#FFFF83";
    } else if (isIconic && isVerified) {
      populatedPigeon.colorField = "#FFFF83";
    } else if (isIconic && breederScoreHigh) {
      populatedPigeon.colorField = "#FFFF83";
    } else if (isVerified && isPedigreeSame && breederScoreHigh) {
      populatedPigeon.colorField = "#90EE90";
    } else if (isVerified && breederScoreHigh) {
      populatedPigeon.colorField = "#90EE90";
    } else if (breederScoreHigh && isPedigreeSame) {
      populatedPigeon.colorField = "#90EE90";
    } else if (isVerified && isPedigreeSame) {
      populatedPigeon.colorField = "#FFFFE0";
    } else if (breederScoreHigh) {
      populatedPigeon.colorField = "#90EE90";
    } else if (isVerified) {
      populatedPigeon.colorField = "#FFFFE0";
    } else if (isPedigreeSame) {
      populatedPigeon.colorField = "#ADD8E6";
    } else if (isIconic) {
      populatedPigeon.colorField = "#FFFF83";
    } else {
      populatedPigeon.colorField = "#FFFFFF";
    }


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
  const pigeon = await Pigeon.findById(pigeonId)
    .populate("fatherRingId") // father object
    .populate("motherRingId") // mother object
    .lean();
  if (!pigeon) throw new ApiError(StatusCodes.NOT_FOUND, "Pigeon not found");

  const fatherId = pigeon.fatherRingId?._id?.toString();
  const motherId = pigeon.motherRingId?._id?.toString();

  // ২. Full siblings (একই বাবা & একই মা)
  let fullSiblings: any[] = [];
  if (fatherId && motherId) {
    fullSiblings = await Pigeon.find({
      _id: { $ne: pigeon._id },
      fatherRingId: fatherId,
      motherRingId: motherId,
    })
      .populate("fatherRingId")
      .populate("motherRingId")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
  }

  // ৩. Half siblings (same father or same mother)
  let halfSiblings: any[] = [];
  const halfOrConditions: any[] = [];

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
      .populate("fatherRingId")
      .populate("motherRingId")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
  }

  // ৪. Type assign করা
  const siblings = [
    ...fullSiblings.map((s) => ({ ...s, type: "Full Sibling" })),
    ...halfSiblings.map((s) => {
      let halfType = "Half Sibling";
      console.log("Checking half sibling:", s.ringNumber);

      if (fatherId && s.fatherRingId?._id?.toString() === fatherId) {
        halfType = "Half Sibling (same father)";
        console.log("Half Sibling (same father) found:", s.ringNumber);
      } else if (motherId && s.motherRingId?._id?.toString() === motherId) {
        halfType = "Half Sibling (same mother)";
        console.log("Half Sibling (same mother) found:", s.ringNumber);
      }

      return { ...s, type: halfType };
    }),
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
      { $or: [{ verified: true }] },
      {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { ringNumber: { $regex: query, $options: "i" } }
        ]
      }
    ]
  }).select("_id name ringNumber gender");

  return pigeons;
};

const searchAllPigeonsByNameFromDB = async (query: string) => {
  const pigeons = await Pigeon.find({
    $and: [
      { status: { $ne: "Deleted" } },
      { $or: [{ verified: true }] },
      {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { ringNumber: { $regex: query, $options: "i" } }
        ]
      }
    ]
  }).select("_id name ringNumber gender");

  return pigeons;
};
const searchAllPigeonsName = async () => {
  const pigeons = await Pigeon.find({
    status: { $ne: "Deleted" }, // Deleted না
    verified: true,             // শুধু verified
  }).select("_id name").lean(); // শুধু _id এবং name নিয়ে আসবে, lean() দিলে plain JS object

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
  searchAllPigeonsName,
  getMyAllPigeonDetailsFromDB,
  togglePigeonStatusInDB
};