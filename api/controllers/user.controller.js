// Importing necessary libraries and modules.
import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Used for password hashing.
import User from "../models/User.js"; // User model.
import { sendError, sendSuccess } from "../utils/createResponse.js";
import Role from "../models/Role.js"; // Importing Role model.

// Constant to represent the number of rounds that bcrypt will use when salting passwords.
// The higher the number, the more secure the hash, but the longer it will take to generate.
const SALT_ROUNDS = 10;

export const createStudentProfessorUser = async (userData) => {
  const {
    firstName,
    lastName,
    userName,
    email,
    password,
    role,
    schoolYear,
    expectedGraduation,
    professorTitle,
    professorDepartment,
  } = userData;

  const userRole = await Role.findOne({ name: role });
  if (!userRole) {
    throw new Error(`Role '${role}' not found in the database.`);
  }

  if (await User.findOne({ $or: [{ email }, { userName }] })) {
    throw new Error("Email or Username already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  let newUser = {
    firstName,
    lastName,
    userName,
    email,
    password: hashedPassword,
    roles: [userRole._id],
  };

  switch (role) {
    case "Student":
      newUser = { ...newUser, schoolYear, expectedGraduation };
      break;
    case "Professor":
      newUser = { ...newUser, professorTitle, professorDepartment };
      break;
    default:
      throw new Error("Invalid role provided.");
  }

  const user = new User(newUser);
  await user.save();
  return user;
};

/**
 * Create a new user.
 * @param {Object} req - Express request object containing user details in body.
 * @param {Object} res - Express response object for sending the response.
 * @param {function} next - Express next middleware function.
 */
// Controller to create a new user.
export const createUser = async (req, res, next) => {
  try {
    const user = await createStudentProfessorUser(req.body);
    // Prepare user for response (excluding password).
    const responseUser = user.toObject();
    delete responseUser.password;
    sendSuccess(res, 201, "User Created Successfully!", responseUser);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

/**
 * Fetch the logged-in user's details from the database.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object for sending the response.
 * @param {function} next - Express next middleware function.
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: "roles",
        select: "name",
      })
      .select("-password");

    if (!user) return sendError(res, 404, "User not found!");

    const responseUser = {
      ...user.toObject(),
      roles: user.roles.map((role) => role.name),
    };

    sendSuccess(res, 200, "User Retrieved Successfully", responseUser);
  } catch (error) {
    next(error);
  }
};

// get user for team
export const getUsersForTeam = async (req, res, next) => {
  try {
    // Ensure the user is logged in
    if (!req.user.id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // Fetch all users from the database
    const users = await User.find({}, "firstName lastName");

    // Send back the array of users
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users for team:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

/**
 * Delete a user by their ID.
 * @param {Object} req - Express request object containing user ID in parameters.
 * @param {Object} res - Express response object for sending the response.
 * @param {function} next - Express next middleware function.
 */
export const deleteUser = async (req, res, next) => {
  try {
    // Ensure the user is logged in
    if (!req.user.id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return sendError(res, 404, "User not found");

    sendSuccess(res, 200, "User Deleted Successfully!");
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

/**
 * Update user's profile information based on their role.
 * @param {Object} req - Express request object containing updated profile details.
 * @param {Object} res - Express response object for sending the response.
 * @param {function} next - Express next middleware function.
 */

export const updateStudentProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { roles } = req.user;

    // Check if user is updating their own profile.
    if (req.user.id !== userId) {
      return next(
        sendError(
          res,
          403,
          "You do not have permission to update another user's profile."
        )
      );
    }

    let updates = req.body;

    // Check for role-specific updates.
    if (roles.includes("Student")) {
      // Using includes to check if user has "Student" role
      updates = {
        ...req.body, // Preserve other fields
        schoolYear: req.body.schoolYear,
        expectedGraduation: req.body.expectedGraduation,
        roles: undefined, // Prevent roles from being updated
      };
    } else {
      return next(
        sendError(res, 400, "Unrecognized user role. Cannot update profile.")
      );
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return next(sendError(res, 404, "User not found."));
    }

    // Respond with the updated user.
    sendSuccess(res, 200, "Student Profile Updated Successfully!", [
      updatedUser,
    ]);
  } catch (error) {
    console.error("Error updating student profile:", error);
    sendError(res, 500, "Error updating student profile.");
  }
};

/**
 * Update professor's profile information based on their role.
 * @param {Object} req - Express request object containing updated profile details.
 * @param {Object} res - Express response object for sending the response.
 * @param {function} next - Express next middleware function.
 */
export const updateProfessorProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { roles } = req.user; // Changed from `role` to `roles`

    // Check if user is updating their own profile.
    if (req.user.id !== userId) {
      return next(
        sendError(
          res,
          403,
          "You do not have permission to update another user's profile."
        )
      );
    }

    let updates = req.body;

    // Check for role-specific updates.
    if (roles.includes("Professor")) {
      // Using includes to check if user has "Professor" role
      updates = {
        ...req.body, // Preserve other fields
        professorTitle: req.body.professorTitle,
        professorDepartment: req.body.professorDepartment,
        roles: undefined, // Prevent roles from being updated
      };
    } else {
      return next(
        sendError(res, 400, "Unrecognized user role. Cannot update profile.")
      );
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return next(sendError(res, 404, "User not found."));
    }

    // Respond with the updated user.
    sendSuccess(res, 200, "Professor Profile Updated Successfully!", [
      updatedUser,
    ]);
  } catch (error) {
    console.error("Error updating professor profile:", error);
    sendError(res, 500, "Error updating professor profile.");
  }
};

// Assuming you have middleware to authenticate and populate req.user
// user.controller.js

// ... other code ...

export const getUserId = async (req, res) => {
  try {
    // Assuming req.user is populated with the authenticated user's information
    if (!req.user) {
      return sendError(res, 401, "Not Authenticated");
    }
    console.log(req.user);
    console.log(req.user._id);

    return sendSuccess(res, 200, "User ID retrieved successfully", {
      _id: req.user.id,
    });
  } catch (error) {
    console.error("Error encountered while retrieving user ID:", error);
    return sendError(res, 500, "Internal Server Error");
  }
};

// ... other code ...

// Error handling middleware
export const errorHandler = (error, req, res, next) => {
  console.error(error.message);
  if (error.kind === "ObjectId" && error.name === "CastError") {
    sendError(res, 400, "Invalid ID provided");
  } else {
    sendError(res, 500, error.message || "Internal Server Error!");
  }
};
