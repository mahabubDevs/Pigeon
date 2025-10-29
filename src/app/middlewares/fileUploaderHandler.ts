// middlewares/fileUploaderHandler.ts

import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../errors/ApiErrors';

const fileUploadHandler = () => {
  const baseUploadDir = path.join(process.cwd(), 'uploads');

  // Ensure main upload folder exists
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir);
  }

  // Create subdirectory if not exists
  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  };

  // ✅ Storage configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir: string;

      const imageFields = [
        'pigeonPhoto',
        'eyePhoto',
        'ownershipPhoto',
        'pedigreePhoto',
        'DNAPhoto',
        'image',
      ];

      // ✅ Choose folder based on file type
      if (file.mimetype === 'application/pdf' || file.fieldname === 'pdf') {
        uploadDir = path.join(baseUploadDir, 'images');
      } else if (imageFields.includes(file.fieldname)) {
        uploadDir = path.join(baseUploadDir, 'images');
      } else if (file.fieldname === 'excel') {
        uploadDir = path.join(baseUploadDir, 'excels');
      } else {
        return cb(new Error('File field is not supported'), '');
      }

      createDir(uploadDir);
      cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const baseName = file.originalname.replace(fileExt, '').toLowerCase().split(' ').join('-');
      const fileName = `${baseName}-${Date.now()}${fileExt}`;
      cb(null, fileName);
    },
  });

  // ✅ File type validation
  const fileFilter = (req: Request, file: any, cb: FileFilterCallback) => {
    const imageFields = [
      'pigeonPhoto',
      'eyePhoto',
      'ownershipPhoto',
      'pedigreePhoto',
      'DNAPhoto',
      'image',
    ];

    if (file.mimetype === 'application/pdf' || file.fieldname === 'pdf') {
      // ✅ Allow PDF files
      cb(null, true);
    } else if (imageFields.includes(file.fieldname)) {
      // ✅ Allow only image types
      if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg'
      ) {
        cb(null, true);
      } else {
        cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only .jpeg, .png, .jpg supported'));
      }
    } else if (file.fieldname === 'excel') {
      // ✅ Allow only Excel/CSV
      if (
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'text/csv' ||
        file.mimetype === 'application/vnd.ms-excel'
      ) {
        cb(null, true);
      } else {
        cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only .xlsx or .csv supported'));
      }
    } else {
      cb(new ApiError(StatusCodes.BAD_REQUEST, 'This file field is not supported'));
    }
  };

  // ✅ Supported upload fields
  const upload = multer({ storage, fileFilter }).fields([
    { name: 'pigeonPhoto', maxCount: 1 },
    { name: 'eyePhoto', maxCount: 1 },
    { name: 'ownershipPhoto', maxCount: 1 },
    { name: 'pedigreePhoto', maxCount: 1 },
    { name: 'DNAPhoto', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'excel', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }, // ✅ Added PDF support
  ]);

  return upload;
};

export default fileUploadHandler;
