import mongoose from "mongoose";
import { AppError } from "../utils/appError.js";
import { ERROR_CODES } from "../utils/errorCodes.js";

export const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new AppError({
        status: 400,
        code: ERROR_CODES.VALIDATION_FAILED,
        message: "Invalid id format",
        details: [{ field: paramName, error: "Invalid ObjectId" }]
      });
    }
    next();
  };
};
