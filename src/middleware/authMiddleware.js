import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      const user = await User.findById(decoded.id)
        .select("-passwordHash");

      if (!user) {
        return res.status(401).json({
          success: false,
          data: null,
          error: "User not found",
        });
      }

      if (user.isBlocked || !user.isActive) {
        return res.status(403).json({
          success: false,
          data: null,
          error: "User is blocked or inactive",
        });
      }

      req.user = user;

      next();

    } catch (error) {
      console.error("AUTH ERROR:", error);

      return res.status(401).json({
        success: false,
        data: null,
        error: "Not authorized, token invalid",
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      data: null,
      error: "Not authorized, no token",
    });
  }
};