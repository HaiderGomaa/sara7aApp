import jwt from "jsonwebtoken";
import { ROLE } from "../../DB/models/user.model.js";
import {v4 as uuid} from "uuid"
/**
 * ✅ إنشاء التوكن
 * @param {object} payload - البيانات اللي هتتحط في التوكن
 * @param {string} secretKey - المفتاح السري المستخدم للتوقيع
 * @param {object} options - إعدادات إضافية (زي مدة الانتهاء)
 */
export const signatureEnum={
  ADMIN:"ADMIN",
  USER:"USER"
}

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
export const getSignature=async({signatureLeve=signatureEnum.ADMIN})=>{
   let signatures={accessSignatures:undefined,refreshSignatures:undefined}
   switch (signatureLeve){
    case signatureEnum.ADMIN:
      signatures.accessSignatures=process.env.TOKEN_ACCESS_ADMIN_SECRETE
      signatures.refreshSignatures=process.env.TOKEN_REFRESH_ADMIN_SECRETE
      break;
      default:
        signatures.accessSignatures=process.env.TOKEN_ACCESS_USER_SECRETE
      signatures.refreshSignatures=process.env.TOKEN_REFRESH_USER_SECRETE
      break;


   }
   return signatures
}
const jwtid=uuid()
 export const getNewLoginCredientials = async (user) => {

  const signatures = await getSignature({
    signatureLeve: user.role != ROLE.USER ? signatureEnum.ADMIN : signatureEnum.USER
  });

  const accessToken = generateToken({
    payload: { id: user._id, email: user.email },
    secretKey: signatures.accessSignatures,
    options: {
      expiresIn: parseInt(process.env.TOKEN_ACCESS_EXPIRS_IN),
      jwtid
    },
  });

  const refreshToken = generateToken({
    payload: { id: user._id, email: user.email },
    secretKey: signatures.refreshSignatures,
    options: {
      expiresIn: parseInt(process.env.REFRESH_ACCESS_EXPIRS_IN),
      jwtid,
    },
  });

  return { accessToken, refreshToken };
};
