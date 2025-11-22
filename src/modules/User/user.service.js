import { asymmetricDecrypt, asymmetricEncrypt } from "../../Utilities/Encryption/encryption.utilities.js";
import * as dbService from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import { successResponse } from "../../Utilities/successResponse.utilities.js";
import { verifyToken } from "../../Utilities/tokens/token.utilities.js";
import tokenModel from "../../DB/models/token.model.js";
import { cloudinaryConfig } from "../../Utilities/multer/cloudinary.config.js";

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
  try {
    const file = req.file;

    const userId = req.user._id;
    const {public_id,secure_url}=await cloudinaryConfig().uploader.upload(file.path,{
      folder:`asra3aApp/Users/${req.user._id}`
    })

    const user = await dbService.findByIdAndUpdate({
      model: userModel,
      id: userId,
      data: {
       
        cloudProfileImage:{public_id,secure_url}
      },
    });
    if(req.user.cloudProfileImage?.public_id){
      await cloudinaryConfig().uploader.destroy(
        req.user.cloudProfileImage.public_id
      )
    }
    return successResponse({
      res,
      statusCode: 200,
      data: { user},
      message: "Profile Image",
    });
  } catch (err) {
    console.log(err);
    
    next(err);
  }
};
export const coverImages = async (req, res, next) => {
  try {

    if (!req.files || req.files.length === 0) {
      return next(new Error("No files uploaded"));
    }

    const userId = req.user._id;

    const attachments = [];

    for (const file of req.files) {
      const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(
        file.path,
        {
          folder: `sara3aApp/users/${userId}/coverImages`,
        }
      );

      attachments.push({ public_id, secure_url });
    }

    // remove previous cloud uploads (metadata stored in cloudCoverImages)
    if (req.user.cloudCoverImages?.length > 0) {
      for (const img of req.user.cloudCoverImages) {
        if (img?.public_id) await cloudinaryConfig().uploader.destroy(img.public_id);
      }
    }

    // save both the public URLs (strings) and the cloud metadata objects
    const user = await dbService.findByIdAndUpdate({
      model: userModel,
      id: userId,
      data: {
        coverImages: attachments.map((a) => a.secure_url),
        cloudCoverImages: attachments,
        $inc: { __v: 1 },
      },
      options: { new: true },
    });

    return successResponse({
      res,
      statusCode: 200,
      data: { user },
      message: "Cover images updated successfully",
    });

  } catch (err) {
    next(err);
  }
};
export const freezeAccount = async (req, res, next) => { 
  const { userId } = req.params;
  if (userId&& req.user.role !== ROLE.ADMIN) {
    return next(new Error("unauthorized access"));
} 
const updateUser= await dbService.findByIdAndUpdate({
  model: userModel,
  id: userId || req.user._id,
  freezedAt:{$exists:false},
  data: {
    freezedAt: new Date(),
    freezedBy: req.user._id,
  },
  options: { new: true },
});

return updateUser?successResponse({
  res,
  statusCode: 200,
  data: { user: updateUser },
  message: "User account frozen successfully",
}):next(new Error("User account not found or already frozen"));
}
export const restoredAccount = async (req, res, next) => { 
  const { userId } = req.params;

const updateUser= await dbService.findByIdAndUpdate({
  model: userModel,
  id: userId ,
  freezedAt:{$exists:true},
  freezeedBy:{$exists:true},
  data: {
    $unset: { freezedAt: true, freezedBy:true },
    restoredAt: new Date(),
    restoredBy: req.user._id,
  },
  options: { new: true },
});

return updateUser?successResponse({
  res,
  statusCode: 200,
  data: { user: updateUser },
  message: "User account restored successfully",
}):next(new Error("User account not found or already restored"));
}