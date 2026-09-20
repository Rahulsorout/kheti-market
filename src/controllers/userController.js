import User from "../models/user.js";
import { success, failure } from "../utils/response.js";


// =====================================================
// GET /api/v1/users/me
// =====================================================

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");

    if (!user) {
      return failure(res, "User not found", 404);
    }

    return success(res, {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.profile?.location || null,
      landSize: user.profile?.landSize || null,
      companyName: user.profile?.companyName || null,
      crops: user.profile?.crops || [],
      isActive: user.isActive,
      isVerified: user.isVerified,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to fetch profile", 500);
  }
};


// =====================================================
// PUT /api/v1/users/me
// =====================================================

export const updateMyProfile = async (req, res) => {
  try {
    const {
      location,
      landSize,
      name,
      phone,
      companyName,
      crops,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return failure(res, "User not found", 404);
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    if (!user.profile) {
      user.profile = {};
    }

    if (location !== undefined) {
      user.profile.location = location;
    }

    if (landSize !== undefined) {
      user.profile.landSize = landSize;
    }

    if (companyName !== undefined) {
      user.profile.companyName = companyName;
    }

    if (crops !== undefined) {
      user.profile.crops = crops;
    }

    await user.save();

    return success(res, {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.profile?.location || null,
      landSize: user.profile?.landSize || null,
      companyName: user.profile?.companyName || null,
      crops: user.profile?.crops || [],
      isActive: user.isActive,
      isVerified: user.isVerified,
      isBlocked: user.isBlocked,
    });
  } catch (err) {
    console.error(err);
    return failure(res, "Invalid input", 400);
  }
};


// =====================================================
// ADMIN: GET ALL USERS
// GET /api/v1/users/admin/all
// =====================================================

export const getAllUsers = async (req, res) => {
  try {
    const {
      search = "",
      role,
      status,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(
      Math.max(Number(limit), 1),
      100
    );

    const query = {};

    // Search
    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim(),
        "i"
      );

      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { "profile.location": searchRegex },
      ];
    }

    // Role filter
    if (
      role &&
      ["FARMER", "BUYER", "ADMIN"].includes(role)
    ) {
      query.role = role;
    }

    // Status filter
    if (status === "ACTIVE") {
      query.isActive = true;
      query.isBlocked = false;
    }

    if (status === "BLOCKED") {
      query.isBlocked = true;
    }

    if (status === "INACTIVE") {
      query.isActive = false;
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      User.countDocuments(query),
    ]);

    const formattedUsers = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,

      role: user.role,

      location: user.profile?.location || null,
      companyName: user.profile?.companyName || null,
      landSize: user.profile?.landSize || null,
      crops: user.profile?.crops || [],

      isActive: user.isActive,
      isVerified: user.isVerified,
      isBlocked: user.isBlocked,

      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return success(res, {
      users: formattedUsers,

      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err) {
    console.error("getAllUsers:", err);
    return failure(res, "Failed to fetch users", 500);
  }
};


// =====================================================
// ADMIN: GET USER BY ID
// GET /api/v1/users/admin/:id
// =====================================================

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-passwordHash")
      .lean();

    if (!user) {
      return failure(res, "User not found", 404);
    }

    return success(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      role: user.role,

      profile: {
        location: user.profile?.location || null,
        companyName: user.profile?.companyName || null,
        landSize: user.profile?.landSize || null,
        crops: user.profile?.crops || [],
      },

      isActive: user.isActive,
      isVerified: user.isVerified,
      isBlocked: user.isBlocked,

      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to fetch user", 500);
  }
};


// =====================================================
// ADMIN: CHANGE ROLE
// PATCH /api/v1/users/admin/:id/role
// =====================================================

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["FARMER", "BUYER", "ADMIN"].includes(role)) {
      return failure(res, "Invalid role", 400);
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return failure(res, "User not found", 404);
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      return failure(
        res,
        "You cannot change your own role",
        400
      );
    }

    user.role = role;

    await user.save();

    return success(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to update user role", 500);
  }
};


// =====================================================
// ADMIN: BLOCK / UNBLOCK USER
// PATCH /api/v1/users/admin/:id/block
// =====================================================

export const toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return failure(res, "User not found", 404);
    }

    // Prevent blocking yourself
    if (user._id.toString() === req.user._id.toString()) {
      return failure(
        res,
        "You cannot block yourself",
        400
      );
    }

    user.isBlocked = !user.isBlocked;

    // Blocked user should not remain active
    if (user.isBlocked) {
      user.isActive = false;
    } else {
      user.isActive = true;
    }

    await user.save();

    return success(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
    });
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to update user status", 500);
  }
};


// =====================================================
// ADMIN: ACTIVATE / DEACTIVATE USER
// PATCH /api/v1/users/admin/:id/status
// =====================================================

export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return failure(res, "User not found", 404);
    }

    if (user._id.toString() === req.user._id.toString()) {
      return failure(
        res,
        "You cannot deactivate yourself",
        400
      );
    }

    user.isActive = !user.isActive;

    await user.save();

    return success(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
    });
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to update user status", 500);
  }
};


// =====================================================
// ADMIN: VERIFY USER
// PATCH /api/v1/users/admin/:id/verify
// =====================================================

export const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return failure(res, "User not found", 404);
    }

    user.isVerified = !user.isVerified;

    await user.save();

    return success(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    });
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to update verification", 500);
  }
};


// =====================================================
// ADMIN: DELETE USER
// DELETE /api/v1/users/admin/:id
// =====================================================

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return failure(res, "User not found", 404);
    }

    // Very important safety check
    if (user._id.toString() === req.user._id.toString()) {
      return failure(
        res,
        "You cannot delete your own account",
        400
      );
    }

    // Don't allow deleting another admin
    if (user.role === "ADMIN") {
      return failure(
        res,
        "Admin accounts cannot be deleted",
        400
      );
    }

    await User.findByIdAndDelete(user._id);

    return success(res, {
      message: "User deleted successfully",
      id: user._id,
    });
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to delete user", 500);
  }
};