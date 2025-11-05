import { asymmetricDecrypt, asymmetricEncrypt } from "../../Utilities/Encryption/encryption.utilities.js";
import * as dbService from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import { successResponse } from "../../Utilities/successResponse.utilities.js";
import { verifyToken } from "../../Utilities/tokens/token.utilities.js";
import tokenModel from "../../DB/models/token.model.js";

export const listAllUser = async (req, res, next) => {
  let users = await dbService.find({
    model: userModel,
    populate: [
      {
        path: "messages",
        select: "content -_id -receiverId",
      },
    ],
  });

  return successResponse({
    res,
    statusCode: 200,
    data: { users },
    message: "Users fetched successfully",
  });
};

export const updateUser = async (req, res, next) => {
  const { firstName, lastName, gender } = req.body;
  const { authorization } = req.headers;

  const decoded = verifyToken({
    token: authorization,
    secretKey: process.env.TOKEN_ACCESS_SECRETE,
  });

  const token = await dbService.findOne({
    model: tokenModel,
    filter: { jwtid: decoded.jti },
  });

  if (token) {
    return next(new Error("token is revoked", { cause: 400 }));
  }

  const user = await dbService.findByIdAndUpdate({
    model: userModel,
    id: decoded.id,
    data: { firstName, lastName, gender, $inc: { __v: 1 } },
  });

  return successResponse({
    res,
    statusCode: 200,
    data: { user },
    message: "User updated successfully",
  });
};
export const profileImage = async (req, res, next) => {
  const { firstName, lastName, gender } = req.body;
  const { authorization } = req.headers;

  const decoded = verifyToken({
    token: authorization,
    secretKey: process.env.TOKEN_ACCESS_SECRETE,
  });

  const token = await dbService.findOne({
    model: tokenModel,
    filter: { jwtid: decoded.jti },
  });

  if (token) {
    return next(new Error("token is revoked", { cause: 400 }));
  }

  const user = await dbService.findByIdAndUpdate({
    model: userModel,
    id: decoded.id,
    data: { firstName, lastName, gender, $inc: { __v: 1 } },
  });

  return successResponse({
    res,
    statusCode: 200,
    data: { file:req.file },
    message: "image updated successfully",
  });
};

