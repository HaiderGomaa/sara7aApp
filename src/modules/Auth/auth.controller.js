import { Router } from "express";
import * as authService from "./auth.service.js";
import { authentication, tokenTypeEnum  } from "../../MiddleWare/auth.middleware.js";
import { validate } from "../../MiddleWare/validation.Middleware.js";
import { signSchema, loginSchema, confirmEmailSchema, forgetPaswordSchema, resetPasswordSchema } from "./auth.validate.js";

const router = Router();

// ✅ signup
router.post("/signup", validate(signSchema), authService.signup);

// ✅ login
router.post("/login", validate(loginSchema), authService.login);

// ✅ confirm email
router.patch("/confirm-email", validate(confirmEmailSchema), authService.confirmEmail);

// ✅ logout
router.post("/revoke-token", authentication(), authService.logOut);

// ✅ refresh token
router.post("/refresh-token",authentication({tokenType:tokenTypeEnum.REFRESH}), authService.refreshToken);

// ✅ forget password
router.patch("/forget-password",validate(forgetPaswordSchema), authService.forgetPsswordOtp);
router.patch("/reset-password", validate(resetPasswordSchema) ,authService.resetPassword);
router.post("/social-login", authService.loginWithGoogle);



export default router;
