import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { success, failure } from "../utils/response.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

export const register = async (req, res) => {
  try {
    const { role, name, email, password, location } = req.body;

    if (!role || !name || !email || !password) {
      return failure(
        res,
        {
          code: "MISSING_FIELDS",
          message: "Missing required fields",
        },
        400
      );
    }

    if (!["FARMER", "BUYER"].includes(role)) {
      return failure(
        res,
        {
          code: "INVALID_ROLE",
          message: "Invalid registration role",
        },
        400
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return failure(
        res,
        {
          code: "EMAIL_EXISTS",
          message: "Email already exists",
        },
        409
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      role,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashedPassword,
      profile: {
        location: location?.trim() || undefined,
      },
      isActive: true,
      isVerified: false,
      isBlocked: false,
    });

    const token = generateToken(user._id);

    return success(
      res,
      {
        token,
        user: {
          id: user._id,
          role: user.role,
          name: user.name,
          email: user.email,
        },
      },
      201
    );
  } catch (err) {
    console.error("REGISTER ERROR:", err);

    return failure(
      res,
      {
        code: "REGISTER_FAILED",
        message: "Registration failed",
        details: process.env.NODE_ENV === "production"
          ? null
          : err.message,
      },
      500
    );
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return failure(
        res,
        {
          code: "MISSING_CREDENTIALS",
          message: "Email and password required",
        },
        400
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return failure(
        res,
        {
          code: "INVALID_CREDENTIALS",
          message: "Invalid credentials",
        },
        401
      );
    }

    if (user.isBlocked) {
      return failure(
        res,
        {
          code: "USER_BLOCKED",
          message: "Your account has been blocked by an administrator",
        },
        403
      );
    }

    if (!user.isActive) {
      return failure(
        res,
        {
          code: "USER_INACTIVE",
          message: "Your account has been deactivated",
        },
        403
      );
    }

    const isMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isMatch) {
      return failure(
        res,
        {
          code: "INVALID_CREDENTIALS",
          message: "Invalid credentials",
        },
        401
      );
    }

    const token = generateToken(user._id);

    return success(res, {
      token,
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return failure(
      res,
      {
        code: "LOGIN_FAILED",
        message: "Login failed",
        details: process.env.NODE_ENV === "production"
          ? null
          : err.message,
      },
      500
    );
  }
};