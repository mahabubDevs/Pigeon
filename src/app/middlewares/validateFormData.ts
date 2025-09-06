import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import ApiError from "../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";

export const validateFormData = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let parsedData: any = {};

      // 1️⃣ multipart/form-data
      if (req.is("multipart/form-data")) {
        parsedData =
          req.body.data && typeof req.body.data === "string"
            ? JSON.parse(req.body.data)
            : req.body.data || { ...req.body };
      } 
      // 2️⃣ application/json
      else if (req.is("application/json")) {
        parsedData =
          req.body.data && typeof req.body.data === "string"
            ? JSON.parse(req.body.data)
            : req.body.data || { ...req.body };
      } else {
        throw new ApiError(StatusCodes.UNSUPPORTED_MEDIA_TYPE, "Unsupported content type");
      }

      // 3️⃣ File থেকে photos attach করা
      if (req.files) {
        const filesArray: Express.Multer.File[] = Object.values(req.files).flat() as Express.Multer.File[];
        parsedData.photos = filesArray.map(file => `/images/${file.filename}`);
      }

      // 4️⃣ photos যদি খালি থাকে, তখন empty array
      if (!parsedData.photos) parsedData.photos = [];

      // 5️⃣ Numeric conversion
      ["birthYear", "racingRating", "racherRating", "breederRating"].forEach(field => {
        if (parsedData[field] !== undefined && parsedData[field] !== "") {
          parsedData[field] = Number(parsedData[field]);
        }
      });

      // 6️⃣ Zod validation
      const parsed = schema.safeParse(parsedData);

      if (!parsed.success) {
        // Field name সহ প্রথম error দেখাবে
        const firstError = parsed.error.issues[0];
        const fieldName = firstError.path[0] || "Field";
        return next(
          new ApiError(StatusCodes.BAD_REQUEST, `${fieldName}: ${firstError.message}`)
        );
      }

      req.body = parsed.data;
      next();
    } catch (err: any) {
      next(err);
    }
  };
};
