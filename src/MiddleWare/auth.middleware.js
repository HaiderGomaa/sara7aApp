import * as dbService from "../DB/db.service.js";
import tokenModel from "../DB/models/token.model.js";
import userModel from "../DB/models/user.model.js";
import { getSignature, verifyToken } from "../Utilities/tokens/token.utilities.js";

export const tokenTypeEnum = {
  ACCESS: "ACCESS",
  REFRESH: "REFRESH",
};

const decodedToken = async ({ authorization, tokenType = tokenTypeEnum.ACCESS } = {}) => {
  if (!authorization || typeof authorization !== "string") {
    throw new Error("invalid token");
  }

  const parts = authorization.split(" ") || [];
  const [bearer, token] = parts;
  if (!bearer || !token) {
    throw new Error("invalid token");
  }

  const signatures = await getSignature({ signatureLeve: bearer });

  const secretKey =
    tokenType === tokenTypeEnum.ACCESS
      ? signatures.accessSignatures
      : signatures.refreshSignatures;

  const decoded = verifyToken({ token, secretKey });

  if (!decoded || !decoded.jti) {
    throw new Error("invalid token");
  }

  const revokedToken = await dbService.findOne({
    model: tokenModel,
    filter: { jwtid: decoded.jti },
  });

  if (revokedToken) {
    throw new Error("token is revoked");
  }

  const user = await dbService.findById({ model: userModel, id: decoded.id });

  if (!user) {
    throw new Error("not register account");
  }

  return { user, decoded };
};

export const authorization = ({ accessRole = [] } = {}) => {
  return (req, res, next) => {
    try {
      if (!req.user || !accessRole.includes(req.user.role)) {
        return next(new Error("unauthorized access"));
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
};

export const authentication = ({ tokenType = tokenTypeEnum.ACCESS } = {}) => {
  return async (req, res, next) => {
    try {
      const { user, decoded } = await decodedToken({
        authorization: req.headers.authorization,
        tokenType,
      });

      req.user = user;
      req.decoded = decoded;

      return next();
    } catch (err) {
      return next(err);
    }
  };
};


