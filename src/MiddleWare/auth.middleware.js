import * as dbService from "../DB/db.service.js";
import tokenModel from "../DB/models/token.model.js";
import userModel from "../DB/models/user.model.js";
import { verifyToken } from "../Utilities/tokens/token.utilities.js"; // ✅ تأكد إنها موجودة

export const authentication   = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    // ✅ التحقق من وجود التوكن
    if (!authorization) {
      return next(new Error("authorization token is missing", { cause: 400 }));
    }

    // ✅ التحقق من البادئة (Bearer أو TOKEN_PREFIX)
    if (!authorization.startsWith(process.env.TOKEN_PREFIX)) {
      return next(new Error("invalid authorization format", { cause: 400 }));
    }

    // ✅ استخراج التوكن
    const token = authorization.split(" ")[1];

    // ✅ فك تشفير التوكن والتحقق منه
    const decoded = verifyToken({
      token,
      secretKey: process.env.TOKEN_ACCESS_SECRETE,
    });

    if (!decoded || !decoded.jti) {
      return next(new Error("invalid token", { cause: 401 }));
    }

    // ✅ التحقق إن التوكن مش متلغي
    const revokedToken = await dbService.findOne({
      model: tokenModel,
      filter: { jwtid: decoded.jti },
    });

    if (revokedToken) {
      return next(new Error("token is revoked", { cause: 401 }));
    }

    // ✅ البحث عن المستخدم
    const user = await dbService.findById({
      model: userModel,
      id: decoded.id,
    });

    if (!user) {
      return next(new Error("user not found", { cause: 404 }));
    }

    // ✅ تخزين البيانات في req
    req.user = user;
    req.decoded = decoded;

    // ✅ الانتقال للـ next middleware
    next();
  } catch (err) {
    // لو فيه خطأ في verifyToken أو غيره
    next(new Error("invalid or expired token", { cause: 401 }));
  }
};
