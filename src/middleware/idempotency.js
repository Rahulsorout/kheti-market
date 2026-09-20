import IdempotencyKey from "../models/idempotencyKey.js";
import { AppError } from "../utils/appError.js";
import { ERROR_CODES } from "../utils/errorCodes.js";

export const idempotency = () => {
  return async (req, res, next) => {
    const key = req.header("Idempotency-Key");

    if (!key) {
      throw new AppError({
        status: 400,
        code: ERROR_CODES.VALIDATION_FAILED,
        message: "Idempotency-Key header is required"
      });
    }

    const endpoint = req.method + " " + req.originalUrl;
    const userId = req.user._id;

    // Check if key already exists
    const existing = await IdempotencyKey.findOne({
      key,
      user: userId,
      endpoint
    });

    if (existing) {
      // Replay old response
      return res.status(existing.responseStatus).json(existing.responseBody);
    }

    // Monkey-patch res.json to capture response
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      try {
        await IdempotencyKey.create({
          key,
          user: userId,
          endpoint,
          responseStatus: res.statusCode,
          responseBody: body
        });
      } catch (err) {
        // Ignore duplicate insert race condition
        if (err.code !== 11000) {
          console.error("Idempotency save error:", err);
        }
      }

      return originalJson(body);
    };

    next();
  };
};
