import multer from "multer";
import path from "node:path";
import fs from "node:fs";

// تعريف أنواع الملفات في object
export const fileValidation = {
  images: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
  video: ["video/mp4", "video/mpeg", "video/ogg", "video/webm"],
  application: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
    "application/zip",
    "application/x-rar-compressed",
  ],
};
export const localFileUpload = ({ customPath = "general", allowedTypes = [] } = {}) => {
  const basePath = `.uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let userBasePath = basePath;
      if (req.user?._id) userBasePath += `/${req.user._id}`;

      const fullPath = path.resolve(`./src/${userBasePath}`);
      if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });

      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const safeName = file.originalname.replace(/\s+/g, "-");
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;
      
      file.finalPath = `${basePath}/${req.user._id}/${uniqueSuffix}`;
      cb(null, uniqueSuffix);
    },
  });

  const fileFilter = (req, file, cb) => {
    // تحويل allowedTypes (مثل ["images", "application"]) إلى قائمة MIME types
    let validMimes = [];
    allowedTypes.forEach(type => {
      if (fileValidation[type]) validMimes = validMimes.concat(fileValidation[type]);
    });

    if (validMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`));
    }
  };

  return multer({ storage, fileFilter });
};

