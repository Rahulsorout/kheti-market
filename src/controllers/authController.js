import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { success, failure } from "../utils/response.js";

// =====================================================
// GENERATE JWT
// =====================================================

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


// =====================================================
// REGISTER
// POST /api/v1/auth/register
// =====================================================

export const register = async (req, res) => {
  try {
    const {
      role,
      name,
      email,
      password,
      location,
    } = req.body;

    // -------------------------------------------------
    // Basic validation
    // -------------------------------------------------

    if (!role || !name || !email || !password) {
      return failure(
        res,
        "Missing required fields",
        400
      );
    }

    // -------------------------------------------------
    // Validate role
    // IMPORTANT:
    // Do not allow public registration as ADMIN.
    // -------------------------------------------------

    if (!["FARMER", "BUYER"].includes(role)) {
      return failure(
        res,
        "Invalid registration role",
        400
      );
    }

    // -------------------------------------------------
    // Normalize email
    // -------------------------------------------------

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // -------------------------------------------------
    // Check existing user
    // -------------------------------------------------

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return failure(
        res,
        "Email already exists",
        409
      );
    }

    // -------------------------------------------------
    // Hash password
    // -------------------------------------------------

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // -------------------------------------------------
    // Create user
    // -------------------------------------------------

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

    // -------------------------------------------------
    // Generate JWT
    // -------------------------------------------------

    const token = generateToken(user._id);

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

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
    console.error(
      "Registration error:",
      err
    );

    return failure(
      res,
      "Invalid input",
      400
    );
  }
};


// =====================================================
// LOGIN
// POST /api/v1/auth/login
// =====================================================

export const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // -------------------------------------------------
    // Basic validation
    // -------------------------------------------------

    if (!email || !password) {
      return failure(
        res,
        "Email and password required",
        400
      );
    }

    // -------------------------------------------------
    // Normalize email
    // -------------------------------------------------

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // -------------------------------------------------
    // Find user
    // -------------------------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return failure(
        res,
        "Invalid credentials",
        401
      );
    }

    // -------------------------------------------------
    // Check account status
    // -------------------------------------------------

    if (user.isBlocked) {
      return failure(
        res,
        "Your account has been blocked by an administrator",
        403
      );
    }

    if (!user.isActive) {
      return failure(
        res,
        "Your account has been deactivated",
        403
      );
    }

    // -------------------------------------------------
    // Compare password
    // -------------------------------------------------

    const isMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isMatch) {
      return failure(
        res,
        "Invalid credentials",
        401
      );
    }

    // -------------------------------------------------
    // Generate JWT
    // -------------------------------------------------

    const token = generateToken(user._id);

    // -------------------------------------------------
    // Response
    // IMPORTANT:
    // role is returned here so frontend knows
    // whether this is FARMER, BUYER or ADMIN.
    // -------------------------------------------------

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
      }
    );

  } catch (err) {
    console.error(
      "Login error:",
      err
    );

    return failure(
      res,
      "Invalid credentials",
      401
    );
  }
};