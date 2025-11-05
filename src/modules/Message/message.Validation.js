
import joi from "joi";
import { Types } from "mongoose"; // Import Mongoose Types for ObjectId validation
import { generalFields } from "../../MiddleWare/validation.Middleware";

export const sendMessageSchema = {
  body: joi.object({
    content: joi.string().min(2).max(500).required(),
  }),

  params: {
    receiverId: generalFields.id.required()
  },
};