import userModel, { GenderProviders } from "../../DB/models/user.model.js";
import tokenModel from "../../DB/models/token.model.js";
import * as dbService from "../../DB/db.service.js";
import { successResponse } from "../../Utilities/successResponse.utilities.js";
import { asymmetricEncrypt } from "../../Utilities/Encryption/encryption.utilities.js";
import { compare, hash } from "../../Utilities/Hashing/hasing.utilities.js";
import { events } from "../../Utilities/Events/event.utilities.js";
import { customAlphabet } from "nanoid";
import { generateToken } from "../../Utilities/tokens/token.utilities.js"; // ✅ تم تعديل السطر هنا فقط
import { v4 as uuid } from "uuid";
import Joi from "joi";
import jwt from "jsonwebtoken";
   import OAuth2Client  from "google-auth-library";


// ✅ Validation Schema
const signSchema = Joi.object({
  firstName: Joi.string().min(3).max(20).required(),
  lastName: Joi.string().min(3).max(20).required(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required(),
  gender: Joi.string().valid("MALE", "FEMALE").required(),
});

// ========================== SIGNUP ==========================
export const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, password, email, gender } = req.body;

    // ✅ Validate input
    const validationResult = signSchema.validate(
      { firstName, lastName, phone, password, email, gender },
      { abortEarly: false }
    );
    if (validationResult.error) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.details.map((err) => err.message),
      });
    }

    // ✅ Check if user already exists
    const checkUser = await dbService.findOne({
      model: userModel,
      filter: { email },
    });
    if (checkUser) {
      return next(new Error("user already exist", { cause: 409 }));
    }

    // ✅ Encrypt phone & hash password
    const encryptionData = asymmetricEncrypt(phone);
    const hashedPassword = await hash({ plainText: password });

    // ✅ Generate OTP for email confirmation
    const otp = customAlphabet("0123456789qwertyuiopasd", 6)();
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // ✅ Create user
    const user = await dbService.create({
      model: userModel,
      data: [
        {
          firstName,
          lastName,
          phone: encryptionData,
          password: hashedPassword,
          email,
          gender,
          confirmemailOtp: await hash({ plainText: otp }),
          otpExpiresAt,
        },
      ],
    });

    // ✅ Send email OTP
    events.emit("comfirmEmail", { to: email, otp });

    return successResponse({
      res,
      statusCode: 201,
      data: { user, otpExpiresAt },
      message: "User created successfully",
    });
  } catch (err) {
    next(err);
  }
};

// ========================== LOGIN ==========================
export const login = async (req, res, next) => {
  try {
    const { password, email } = req.body;

    const checkUser = await dbService.findOne({
      model: userModel,
      filter: { email },
    });

    if (!checkUser) {
      return next(new Error("user not found", { cause: 404 }));
    }

    const match = await compare({
      plainText: password,
      hash: checkUser.password,
    });

    if (!match) {
      return next(new Error("invalid email or password", { cause: 400 }));
    }

    // ✅ Generate tokens
    const accessToken = generateToken({
      payload: { id: checkUser._id, email: checkUser.email },
      secretKey: process.env.TOKEN_ACCESS_SECRETE,
      options: {
        expiresIn: parseInt(process.env.TOKEN_ACCESS_EXPIRS_IN),
        jwtid: uuid(),
      },
    });

    const refreshToken = generateToken({
      payload: { id: checkUser._id, email: checkUser.email },
      secretKey: process.env.TOKEN_REFRESH_SECRETE,
      options: {
        expiresIn: parseInt(process.env.REFRESH_ACCESS_EXPIRS_IN),
        jwtid: uuid(),
      },
    });

    return successResponse({
      res,
      statusCode: 200,
      data: { accessToken, refreshToken },
      message: "User logged in successfully",
    });
  } catch (err) {
    next(err);
  }
};

// ========================== CONFIRM EMAIL ==========================
export const confirmEmail = async (req, res, next) => {
  try {
    const { otp, email } = req.body;

    const checkUser = await dbService.findOne({
      model: userModel,
      filter: {
        email,
        confirmEmail: { $exists: false },
        confirmemailOtp: { $exists: true },
      },
    });

    if (!checkUser) {
      return next(
        new Error("user not found or email already confirmed", { cause: 404 })
      );
    }

    // ✅ Verify OTP
    const validOtp = await compare({
      plainText: otp,
      hash: checkUser.confirmemailOtp,
    });
    if (!validOtp) {
      return next(new Error("invalid otp", { cause: 400 }));
    }

    // ✅ Update user status
    await dbService.updateOne({
      model: userModel,
      filter: { _id: checkUser._id },
      data: {
        confirmEmail: true,
        confirmemailOtp: undefined,
        otpExpiresAt: undefined,
      },
    });

    // ✅ Generate tokens after confirmation
    const accessToken = generateToken({
      payload: { id: checkUser._id, email: checkUser.email },
      secretKey: process.env.TOKEN_ACCESS_SECRETE,
      options: {
        expiresIn: parseInt(process.env.TOKEN_ACCESS_EXPIRS_IN),
        jwtid: uuid(),
      },
    });

    const refreshToken = generateToken({
      payload: { id: checkUser._id, email: checkUser.email },
      secretKey: process.env.TOKEN_REFRESH_SECRETE,
      options: {
        expiresIn: parseInt(process.env.REFRESH_ACCESS_EXPIRS_IN),
        jwtid: uuid(),
      },
    });

    return successResponse({
      res,
      statusCode: 200,
      data: { accessToken, refreshToken },
      message: "Email confirmed successfully",
    });
  } catch (err) {
    next(err);
  }
};

// ========================== REFRESH TOKEN ==========================
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new Error("refresh token is required", { cause: 400 }));
    }

    // ✅ Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.TOKEN_REFRESH_SECRET
    );

    // ✅ Check user still exists
    const checkUser = await dbService.findOne({
      model: userModel,
      filter: { _id: decoded.id, email: decoded.email },
    });

    if (!checkUser) {
      return next(new Error("user not found", { cause: 404 }));
    }

    // ✅ Generate new access token
    const newAccessToken = generateToken({
      payload: { id: checkUser._id, email: checkUser.email },
      secretKey: process.env.TOKEN_ACCESS_SECRET,
      options: {
        expiresIn: parseInt(process.env.TOKEN_ACCESS_EXPIRS_IN),
        jwtid: uuid(),
      },
    });

    return successResponse({
      res,
      statusCode: 200,
      data: { accessToken: newAccessToken },
      message: "Access token refreshed successfully",
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new Error("refresh token expired", { cause: 401 }));
    }
    next(err);
  }
};

// ========================== LOGOUT / REVOKE TOKEN ==========================
export const logOut = async (req, res, next) => {
  try {
    await dbService.create({
      model: tokenModel,
      data: [
        {
          jwtid: req.decoded.jti,
          revokedAt: new Date(), // لحظة الخروج الفعلية
          userId: req.user._id,
        },
      ],
    });

    return successResponse({
      res,
      statusCode: 200,
      message: "Token loggedOut successfully",
    });
  } catch (err) {
    next(err);
  }
};
export const forgetPsswordOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const otp= await customAlphabet("0123456789qjhdsj",6)()

    const user = await dbService.findByIdAndUpdate({
      model: userModel,
      filter: { email,
        confirmEmail:{$exists:true}
       },
       data:{
        forgetPsswordOtp:await hash({plainText:otp})
       }
    });

    if (!user) {
      return next(new Error("user not found", { cause: 404 }));
    }
    events.emit("forgetPssword",{
      to:email,firstName:user.firstName,otp
    })

   
    return successResponse({
      res,
      statusCode: 200,
      data: { accessToken, refreshToken },
      message: "check your box",
    });
  } catch (err) {
    next(err);
  }
};
async function verifyGoogleAccount({idToken}){
const client = new OAuth2Client();
 const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,  // Specify the WEB_CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[WEB_CLIENT_ID_1, WEB_CLIENT_ID_2, WEB_CLIENT_ID_3]
  });
    const payload = ticket.getPayload();
  
return payload

}
export const loginWithGoogle = async (req, res, next) => {
  try {
     const {idToken}=req.body

     const { email, email_verified, given_name, family_name, picture } = payload;
     await verifyGoogleAccount({idToken})
  if (!email_verified) {
    throw new Error("Email not verified");
  }

  // تحقق من وجود المستخدم في قاعدة البيانات
  const user = await dbService.findOne({
    model: userModel,
    filter: { email },
  });
  if(user)
  {
    if(user.providers===GenderProviders.GOOGLE)
    {
 // ✅ Generate tokens
    const accessToken = generateToken({
      payload: { id: user._id, email: user.email },
      secretKey: process.env.TOKEN_ACCESS_SECRETE,
      options: {
        expiresIn: parseInt(process.env.TOKEN_ACCESS_EXPIRS_IN),
        jwtid: uuid(),
      },
    });

    const refreshToken = generateToken({
      payload: { id: user._id, email: user.email },
      secretKey: process.env.TOKEN_REFRESH_SECRETE,
      options: {
        expiresIn: parseInt(process.env.REFRESH_ACCESS_EXPIRS_IN),
        jwtid: uuid(),
      },
    });

    return successResponse({
      res,
      statusCode: 200,
      data: { accessToken, refreshToken },
      message: "User login successfully",
    });
    }
  }
  else
  {
     newUser = await dbService.create({
        model: userModel,
        data: [{
          firstName: given_name,
          lastName: family_name,
          email,
          confirmEmail: Date.now,
          providers:GenderProviders.GOOGLE
        }],
      });
  }
       const accessToken = generateToken({
      payload: { id: user._id, email: user.email },
      secretKey: process.env.TOKEN_ACCESS_SECRETE,
      options: {
        expiresIn: parseInt(process.env.TOKEN_ACCESS_EXPIRS_IN),
        jwtid: uuid(),
      },
    });

    const refreshToken = generateToken({
      payload: { id: user._id, email: user.email },
      secretKey: process.env.TOKEN_REFRESH_SECRETE,
      options: {
        expiresIn: parseInt(process.env.REFRESH_ACCESS_EXPIRS_IN),
        jwtid: uuid(),
      },
    });
    return successResponse({
      res,
      statusCode: 200,
      data: { accessToken, refreshToken },
      message: "login successfully",
    });
  } catch (err) {
    next(err);
  }
};
export const resetPassword = async (req, res, next) => {
  try {
    const { email,otp,password } = req.body;

    const user = await dbService.findByIdAndUpdate({
      model: userModel,
      filter: { email,
        confirmEmail:{$exists:true}
       },
       
    });

    if (!user) {
      return next(new Error("user not found", { cause: 404 }));

    }
    if(!(await compare({plainText:otp,hash:user.forgetPsswordOtp})))
      return next(new Error("invaild otp", { cause: 400 }));
    
    await dbService.updateOne({
      model:userModel,
      filter:{email},
      data:{password:await hash({plainText:password}),
     $unset:{forgetPsswordOtp:true},
    $inc:{__v:1}}
    })

    events.emit("forgetPssword",{
      to:email,firstName:user.firstName,otp
    })

   
    return successResponse({
      res,
      statusCode: 200,
      message: "password reset successfully",
    });
  } catch (err) {
    next(err);
  }
};
