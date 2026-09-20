import { AppError } from "../utils/appError.js";
import { ERROR_CODES } from "../utils/errorCodes.js";

// In-memory store: key -> { count, resetAt }
const store = new Map();

// Helper to get identifier (user or IP)
const getClientId = (req) => {
  if (req.user && req.user._id) {
    return `user:${req.user._id.toString()}`;
  }
  return `ip:${req.ip}`;
};

// Factory to create rate limiter
export const rateLimit = ({
  limit = 100,
  windowMs = 60 * 1000 // 1 minute
}) => {
  return (req, res, next) => {
    const now = Date.now();
    const clientId = getClientId(req);
    const key = `${clientId}:${req.baseUrl}`;

    let entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = {
        count: 0,
        resetAt: now + windowMs
      };
      store.set(key, entry);
    }

    entry.count += 1;

    const remaining = Math.max(0, limit - entry.count);
    const resetUnix = Math.floor(entry.resetAt / 1000);

    // Set headers (ALWAYS)
    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetUnix);

    if (entry.count > limit) {
      // Too many requests
      throw new AppError({
        status: 429,
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        message: "Too many requests, please try again later",
        details: {
          retryAfter: resetUnix
        }
      });
    }

    next();
  };
};
