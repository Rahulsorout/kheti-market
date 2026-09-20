import { randomUUID } from "crypto";

export const requestContext = (req, res, next) => {
  // If client already sent one (e.g. gateway), reuse it
  const incoming = req.header("X-Request-Id");

  const requestId = incoming || randomUUID();

  req.requestId = requestId;

  // Always return it in response headers
  res.setHeader("X-Request-Id", requestId);

  next();
};
