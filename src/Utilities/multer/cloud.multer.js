import multer from "multer";
import { fileValidation } from "./local.multer.js";

export const cloudFileUpload = ({ allowedTypes = [] } = {}) => {

  const storage = multer.diskStorage({
   
  });

  const fileFilter = (req, file, cb) => {
    // تحويل allowedTypes (مثل ["images", "application"]) إلى قائمة MIME types
    let validMimes = [];
    allowedTypes.forEach((type) => {
      if (fileValidation[type]) validMimes = validMimes.concat(fileValidation[type]);
    });

    if (validMimes.length === 0) {
      // if allowedTypes resolved to nothing, fallback to accepting all types
      return cb(null, true);
    }

    if (validMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`));
    }
  };

  return multer({ storage, fileFilter });
};

