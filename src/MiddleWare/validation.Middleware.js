import Joi from "joi";
import { GenderTypes } from "../DB/models/user.model.js";
import { Types } from "mongoose";
// src/Middlewares/JS/validation.middleware.js

export const validate = (schema) => {
  return (req, res, next) => {
    const validationError = [];
    
    // Loop through each key in the provided validation schema
    for (const key of Object.keys(schema)) {
      // Validate the part of the request (e.g., req.body, req.query, req.params) 
      // corresponding to the current schema key (e.g., 'body', 'query')
      const validationResults = schema[key].validate(req[key], {
        abortEarly: false, // Collect all errors, not just the first one
      });

      // If validation fails for this part of the request
      if (validationResults.error) {
        // Push the error details into the validationError array
        validationError.push({ key, details: validationResults.error.details });
      }
    }

    // Check if any validation errors were collected
    if (validationError.length) {
      // If there are errors, return a 400 Bad Request response with the details
      return res
        .status(400)
        .json({ message: "Validation Error", details: validationError });
    }

    // If no errors, call the next middleware/controller
    return next();
  };
};
export const generalFields={
     firstName:Joi.string().min(2).max(20).messages({
        "string.min":"first name must be a least 2 character long",
        "string.max":"first name must be a most 20 character long",
        "any.required":"first name is mandatory",
    
      }),
      lastName:Joi.string().max(20).min(2).messages({
        "string.min":"first name must be a least 2 character long",
        "string.max":"first name must be a most 20 character long",
        "any.required":"first name is mandatory",
    
      }),
      email:Joi.string().email({minDomainSegments:2,maxDomainSegments:5,tlds:{allow:["com","net","io","org"]}}).required(),
      password:Joi.string(),
      confirmePassword:Joi.ref("password"),
      gender:Joi.string().valid(...Object.values(GenderTypes)).default(GenderTypes.MALE),
      phone:Joi.string().pattern(new RegExp(/^01[0125][0-8]{8}$/)),
      otp:Joi.string(),
      id:Joi.string().custom((value, helpers) => {
            if (Types.ObjectId.isValid(value)) {
              return value; // Return the value if it's valid
            }
            
            // If not valid, return a custom error message
            return helpers.message("Invalid ObjectId Format");
          }),
      file:{
        fieldname:Joi.string(),
        originalname:Joi.string(),
        encoding:Joi.string(),
        mimetype:Joi.string(),
        size:Joi.number().positive(),
        filename:Joi.string(),
        finalPath:Joi.string(),
        path:Joi.string(),
        destination:Joi.string()




      }    
}