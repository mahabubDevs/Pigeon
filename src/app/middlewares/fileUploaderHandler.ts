// middlewares/fileUploaderHandler.ts

import { Request } from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import ApiError from '../../errors/ApiErrors';

const fileUploadHandler = () => {
  const baseUploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir);
  }

  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  };

const storage = multer.diskStorage({
  destination: (req, file, cb: (error: Error | null, destination: string) => void) => {
    let uploadDir: string;
    const imageFields = ['pigeonPhoto', 'eyePhoto', 'ownershipPhoto', 'pedigreePhoto', 'DNAPhoto','image'];

    if (imageFields.includes(file.fieldname)) {
      uploadDir = path.join(baseUploadDir, 'images');
    } else if (file.fieldname === 'excel') {
      uploadDir = path.join(baseUploadDir, 'excels');
    } else {
      return cb(new Error('File field is not supported'), ''); // এখানে destination দিতে হবে
    }

    createDir(uploadDir);
    cb(null, uploadDir); // normal case
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName =
      file.originalname.replace(fileExt, '').toLowerCase().split(' ').join('-') +
      '-' +
      Date.now();
    cb(null, fileName + fileExt);
  },
});

  const fileFilter = (req: Request, file: any, cb: FileFilterCallback) => {
    const imageFields = ['pigeonPhoto', 'eyePhoto', 'ownershipPhoto', 'pedigreePhoto', 'DNAPhoto','image'];

    if (imageFields.includes(file.fieldname)) {
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
      if (
        file.mimetype ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
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

  const upload = multer({ storage, fileFilter }).fields([
    { name: 'pigeonPhoto', maxCount: 1 },
    { name: 'eyePhoto', maxCount: 1 },
    { name: 'ownershipPhoto', maxCount: 1 },
    { name: 'pedigreePhoto', maxCount: 1 },
    { name: 'DNAPhoto', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'excel', maxCount: 1 },
  ]);

  return upload;
};

export default fileUploadHandler;
