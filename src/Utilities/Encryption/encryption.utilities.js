import crypto from "crypto";
import fs from "fs";
import path from "path";

// =============================
// 🔧 الإعدادات الأساسية
// =============================
// Provide safe defaults when environment variables are missing to avoid startup crashes in dev.
const ENCRYPTION_SECRET_KEY = process.env.ENCRYPTION_SECRETE_KEY
  ? Buffer.from(process.env.ENCRYPTION_SECRETE_KEY)
  : crypto.randomBytes(32); // default 32 bytes for AES-256

const IV_LENGTH = +process.env.IV_LENGTH || 16; // default IV length for AES

const privateKeyPath = path.resolve("private.pem");
const publicKeyPath = path.resolve("public.pem");

let privateKey;
let publicKey;

// ✅ توليد المفاتيح لو مش موجودة
if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
  privateKey = fs.readFileSync(privateKeyPath, "utf8");
  publicKey = fs.readFileSync(publicKeyPath, "utf8");
  console.log("✅ RSA Keys loaded from existing files");
} else {
  console.log("⚙️ Generating new RSA key pair...");
  const { privateKey: priv, publicKey: pub } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "pkcs1", format: "pem" },
    privateKeyEncoding: { type: "pkcs1", format: "pem" },
  });

  fs.writeFileSync(privateKeyPath, priv);
  fs.writeFileSync(publicKeyPath, pub);

  privateKey = priv;
  publicKey = pub;
  console.log("🔑 RSA Keys generated and saved");
}

// =============================
// 🧩 AES (Symmetric Encryption)
// =============================

// ✅ تشفير نصوص عادية (ليس OTP)
export const encrypt = (plainText) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_SECRET_KEY, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  // نرجع IV مع النص المشفر
  return iv.toString("hex") + ":" + encrypted;
};

// ✅ فك تشفير النصوص العادية
export const decrypt = (encryptedData) => {
  const [ivHex, encryptedHex] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_SECRET_KEY, iv);
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

// ✅ تشفير OTP مع صلاحية انتهاء
export const encryptOtp = (otp, expiresInMinutes = 5) => {
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  const data = JSON.stringify({ otp, expiresAt });

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_SECRET_KEY, iv);

  let encrypted = cipher.update(data, "utf-8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
};

// ✅ فك التشفير والتحقق من صلاحية OTP
export const decryptAndVerifyOtp = (encryptedData, inputOtp) => {
  try {
    const [ivHex, encryptedHex] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_SECRET_KEY, iv);
    let decrypted = decipher.update(encryptedHex, "hex", "utf-8");
    decrypted += decipher.final("utf-8");

    const { otp, expiresAt } = JSON.parse(decrypted);

    if (Date.now() > expiresAt) {
      return { valid: false, reason: "OTP expired ⏰" };
    }

    if (otp !== inputOtp) {
      return { valid: false, reason: "Invalid OTP ❌" };
    }

    return { valid: true, reason: "OTP verified ✅" };
  } catch (error) {
    return { valid: false, reason: "Decryption failed ⚠️" };
  }
};

// ✅ إنشاء OTP عشوائي من 6 أرقام
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// =============================
// 🔐 RSA (Asymmetric Encryption)
// =============================

// ✅ تشفير نص عادي باستخدام المفتاح العام
export const asymmetricEncrypt = (plainText) => {
  const bufferData = Buffer.from(plainText, "utf8");
  const encryptedData = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    bufferData
  );
  return encryptedData.toString("base64");
};

// ✅ فك التشفير باستخدام المفتاح الخاص
export const asymmetricDecrypt = (encryptedText) => {
  const bufferData = Buffer.from(encryptedText, "base64");
  const decryptedData = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    bufferData
  );
  return decryptedData.toString("utf8");
};
