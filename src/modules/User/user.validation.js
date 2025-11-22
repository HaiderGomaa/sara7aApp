import joi from "joi";
import { generalFields } from "../../MiddleWare/validation.Middleware.js";
import { fileValidation } from "../../Utilities/multer/local.multer.js";

// validation for single profile image -> multer sets req.file
export const profileImageSchema = {
  file: joi
    .object({
      fieldname: generalFields.file.fieldname.valid("profileImage").required(),
      originalname: generalFields.file.originalname.required(),
      encoding: generalFields.file.encoding.required(),
      size: generalFields.file.size.max(5 * 1024 * 1024).required(),
      mimetype: generalFields.file.mimetype
        .valid(...fileValidation.images)
        .required(),
      path: generalFields.file.path.required(),
      destination: generalFields.file.destination.required(),
  filename: generalFields.file.filename.required(),
  finalPath: generalFields.file.finalPath,
    })
    .required(),
};

// validation for multiple cover images -> multer sets req.files (array)
export const coverImagesSchema = {
  files: joi
    .array()
    .items(
      joi.object({
        fieldname: generalFields.file.fieldname
          .valid("coverImages")
          .required(),
        originalname: generalFields.file.originalname.required(),
        encoding: generalFields.file.encoding.required(),
        size: generalFields.file.size.max(5 * 1024 * 1024).required(),
        mimetype: generalFields.file.mimetype
          .valid(...fileValidation.images)
          .required(),
        path: generalFields.file.path.required(),
        destination: generalFields.file.destination.required(),
  filename: generalFields.file.filename.required(),
  finalPath: generalFields.file.finalPath,
      })
    )
    .min(1)
    .max(4)
    .required(),
};
export const freezeAccountSchema = {
  params: joi.object({
    userId: generalFields.id,
  }),
};
export const restoredAccountSchema  = {
  params: joi.object({
    userId: generalFields.id,
  }),
};