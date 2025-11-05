"use strict";
// middlewares/fileUploaderHandler.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../../errors/ApiErrors"));
const fileUploadHandler = () => {
    const baseUploadDir = path_1.default.join(process.cwd(), 'uploads');
    // Ensure main upload folder exists
    if (!fs_1.default.existsSync(baseUploadDir)) {
        fs_1.default.mkdirSync(baseUploadDir);
    }
    // Create subdirectory if not exists
    const createDir = (dirPath) => {
        if (!fs_1.default.existsSync(dirPath)) {
            fs_1.default.mkdirSync(dirPath, { recursive: true });
        }
    };
    // ✅ Storage configuration
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            let uploadDir;
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
                uploadDir = path_1.default.join(baseUploadDir, 'images');
            }
            else if (imageFields.includes(file.fieldname)) {
                uploadDir = path_1.default.join(baseUploadDir, 'images');
            }
            else if (file.fieldname === 'excel') {
                uploadDir = path_1.default.join(baseUploadDir, 'excels');
            }
            else {
                return cb(new Error('File field is not supported'), '');
            }
            createDir(uploadDir);
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const fileExt = path_1.default.extname(file.originalname);
            const baseName = file.originalname.replace(fileExt, '').toLowerCase().split(' ').join('-');
            const fileName = `${baseName}-${Date.now()}${fileExt}`;
            cb(null, fileName);
        },
    });
    // ✅ File type validation
    const fileFilter = (req, file, cb) => {
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
        }
        else if (imageFields.includes(file.fieldname)) {
            // ✅ Allow only image types
            if (file.mimetype === 'image/jpeg' ||
                file.mimetype === 'image/png' ||
                file.mimetype === 'image/jpg') {
                cb(null, true);
            }
            else {
                cb(new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Only .jpeg, .png, .jpg supported'));
            }
        }
        else if (file.fieldname === 'excel') {
            // ✅ Allow only Excel/CSV
            if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.mimetype === 'text/csv' ||
                file.mimetype === 'application/vnd.ms-excel') {
                cb(null, true);
            }
            else {
                cb(new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Only .xlsx or .csv supported'));
            }
        }
        else {
            cb(new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'This file field is not supported'));
        }
    };
    // ✅ Supported upload fields
    const upload = (0, multer_1.default)({ storage, fileFilter }).fields([
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
exports.default = fileUploadHandler;
