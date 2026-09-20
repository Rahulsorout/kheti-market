import { ERROR_CODES } from "../utils/errorCodes.js";

const errorHandler = (err, req, res, next) => {
  console.error(`❌ Error [${req.requestId}]:`, err);


  const status = err.status || 500;
  const code = err.code || ERROR_CODES.INTERNAL_ERROR;

  return res.status(status).json({
    success: false,
    error: {
      code,
      message: err.message || "Something went wrong",
      details: err.details || null
    },
    meta: {
      requestId: req.requestId
    }
  });
};
export default errorHandler;