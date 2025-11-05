import joi from "joi";
import { generalFields } from "../../MiddleWare/validation.Middleware.js";

export const signSchema = {
  body: joi.object({
    firstName: generalFields.firstName.required(),
    lastName: generalFields.lastName.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmePassword: generalFields.confirmePassword,
    gender: generalFields.gender.required(),
    phone: generalFields.phone.required(),
  }),
};

export const loginSchema = {
  body: joi.object({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
  }),
};

export const confirmEmailSchema = {
  body: joi.object({
    email: generalFields.email.required(),
    otp: generalFields.otp.required(),
  }),
};
export const forgetPaswordSchema = {
  body: joi.object({
    email: generalFields.email.required(),
  }),
};
export const resetPasswordSchema = {
  body: joi.object({
    otp: generalFields.otp.required(),
   
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmePassword: generalFields.confirmePassword,
   
  }),
};
