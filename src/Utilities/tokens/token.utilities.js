import jwt from "jsonwebtoken";

/**
 * ✅ إنشاء التوكن
 * @param {object} payload - البيانات اللي هتتحط في التوكن
 * @param {string} secretKey - المفتاح السري المستخدم للتوقيع
 * @param {object} options - إعدادات إضافية (زي مدة الانتهاء)
 */
export const generateToken = ({
  payload,
  secretKey = process.env.TOKEN_ACCESS_SECRET,
  options = { expiresIn: process.env.TOKEN_ACCESS_EXPIRS_IN },
}) => {
  return jwt.sign(payload, secretKey, options);
};

/**
 * ✅ التحقق من صحة التوكن
 * @param {string} token - التوكن اللي عايز تتحقق منه
 * @param {string} secretKey - المفتاح السري اللي تم التوقيع به
 */
export const verifyToken = ({
  token,
  secretKey = process.env.TOKEN_ACCESS_SECRET,
}) => {
  return jwt.verify(token, secretKey);
};
