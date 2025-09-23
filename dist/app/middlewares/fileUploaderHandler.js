"use strict";
// middlewares/fileUploaderHandler.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const http_status_codes_1 = require("http-status-codes");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const ApiErrors_1 = __importDefault(require("../../errors/ApiErrors"));
const fileUploadHandler = () => {
    const baseUploadDir = path_1.default.join(process.cwd(), 'uploads');
    if (!fs_1.default.existsSync(baseUploadDir)) {
        fs_1.default.mkdirSync(baseUploadDir);
    }
    const createDir = (dirPath) => {
        if (!fs_1.default.existsSync(dirPath)) {
            fs_1.default.mkdirSync(dirPath);
        }
    };
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            let uploadDir;
            switch (file.fieldname) {
                case 'image':
                    uploadDir = path_1.default.join(baseUploadDir, 'images');
                    break;
                case 'excel':
                    uploadDir = path_1.default.join(baseUploadDir, 'excels');
                    break;
                default:
                    throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'File is not supported');
            }
            createDir(uploadDir);
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const fileExt = path_1.default.extname(file.originalname);
            const fileName = file.originalname.replace(fileExt, '').toLowerCase().split(' ').join('-') +
                '-' +
                Date.now();
            cb(null, fileName + fileExt);
        },
    });
    const filterFilter = (req, file, cb) => {
        if (file.fieldname === 'image') {
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
            if (file.mimetype ===
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.mimetype === 'text/csv' ||
                file.mimetype === 'application/vnd.ms-excel') {
                cb(null, true);
            }
            else {
                cb(new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Only .xlsx or .csv supported'));
            }
        }
        else {
            cb(new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'This file is not supported'));
        }
    };
    const upload = (0, multer_1.default)({ storage, fileFilter: filterFilter }).fields([
        { name: 'image', maxCount: 3 },
        { name: 'excel', maxCount: 1 },
    ]);
    return upload;
};
exports.default = fileUploadHandler;
