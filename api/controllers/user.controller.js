// Importing necessary libraries and modules.
import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Used for password hashing.
import User from "../models/User.js"; // User model.
import { sendError, sendSuccess } from "../utils/createResponse.js";
import Role from "../models/Role.js"; // Importing Role model.
// ... other imports ...

// Constant to represent the number of rounds that bcrypt will use when salting passwords.
// The higher the number, the more secure the hash, but the longer it will take to generate.
const SALT_ROUNDS = 10;

// This can be in a separate utilities file or within the user.controller.js
export const createStudentProfessorUser = async (userData) => {
  // Extract relevant fields from userData
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
  const userExists = await User.findOne({
    $or: [{ email }, { userName }],
  });
  if (userExists) throw new Error("Email or Username already exists.");

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    firstName,
    lastName,
    userName,
    email,
    password: hashedPassword,
    roles: [userRole._id],
  };

  if (role === "Student") {
    newUser.schoolYear = schoolYear;
    newUser.expectedGraduation = expectedGraduation;
  } else if (role === "Professor") {
    newUser.professorTitle = professorTitle;
    newUser.professorDepartment = professorDepartment;
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
 * Update an existing user based on provided ID.
 * @param {Object} req - Express request object containing updated user details in body.
 * @param {Object} res - Express response object for sending the response.
 * @param {function} next - Express next middleware function.
 */

// Controller to update an existing user.
export const updateUser = async (req, res, next) => {
  try {
    // Extracting password from the update payload, if present.
    const { password, ...otherUpdates } = req.body;

    let updates = otherUpdates;

    // If password is provided in the updates, hash it before updating in the database.
    if (password) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      updates = { ...updates, password: hashedPassword };
    }

    // Finding the user by ID and updating with the new details.
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    // If user not found, return an error response.
    if (!user) return sendError(res, 404, "User not found");

    // Preparing the user object to be sent in the response.
    const responseUser = user.toObject();
    delete responseUser.password; // Removing the password from the response object.

    // Sending the success response.
    sendSuccess(res, 200, "User Updated Successfully", responseUser);
  } catch (error) {
    // Determine the error type and set appropriate status
    const status = error instanceof mongoose.Error.ValidationError ? 400 : 500;
    // Send the error using the sendError function
    next(sendError(res, status, error.message));
  }
};
/**
 * Fetch all users from the database with pagination options.
 * @param {Object} req - Express request object with optional pagination query parameters.
 * @param {Object} res - Express response object for sending the response.
 * @param {function} next - Express next middleware function.
 */
// Controller function to handle the retrieval of all users with pagination
export const getAllUsers = async (req, res, next) => {
  try {
    // Retrieve all users from the database.
    const users = await User.find();

    // If there are no users in the database, return a 404 error.
    if (!users.length) return sendError(res, 404, "No users found!");
    sendSuccess(res, 200, "All Users Retrieved Successfully", [users]); // Send array of users
  } catch (error) {
    console.error("Error fetching users:", error);
    return next(sendError(res, 500, "Internal Server Error!"));
  }
};

export const getUsersForTeam = async (req, res, next) => {
  try {
    const users = await User.find({}, "firstName lastName");
    res.status(200).json(users); // This sends array of users for a team, which is expected
  } catch (error) {
    console.error("Error fetching users for team:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};
/**
 * Retrieve a single user by their ID.
 * @param {Object} req - Express request object containing user ID in parameters.
 * @param {Object} res - Express response object for sending the response.
 * @param {function} next - Express next middleware function.
 */

export const getUserById = async (req, res, next) => {
  const { id } = req.params;

  // Validate the format of the provided user ID.
  if (!mongoose.Types.ObjectId.isValid(id))
    return sendError(res, 400, "Invalid User ID!");

  try {
    // Retrieve a user from the database using the provided ID.
    const user = await User.findById(id);

    // If no user is found with the provided ID, return a 404 error.
    if (!user) return sendError(res, 404, "User not found!");

    // If a user is found, return the user in the response.
    return sendSuccess(res, 200, "Single User", [user]);
  } catch (error) {
    console.error(`Error fetching user with ID ${id} :`, error); // Log error details for debugging
    sendError(res, 500, "Internal Server Error while fetching user!");
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

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { role } = req.user; // Assuming your authentication middleware sets this.

    // Check if user is updating their own profile.
    if (!req.user._id.equals(userId)) {
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
    if (role === "Student") {
      updates = {
        schoolYear: req.body.schoolYear,
        expectedGraduation: req.body.expectedGraduation,
      };
    } else if (role === "Professor") {
      updates = {
        professorTitle: req.body.professorTitle,
        professorDepartment: req.body.professorDepartment,
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
    sendSuccess(res, 200, "User Profile Updated Successfully!", [updatedUser]);
  } catch (error) {
    console.error("Error updating user profile:", error);
    next(sendError(res, 500, "Error updating user profile."));
  }
};

export const getRoleMappings = async (req, res, next) => {
  try {
    const roles = await Role.find();
    const mappings = {};
    roles.forEach((role) => {
      mappings[role._id] = role.name;
    });
    console.log("Role mappings:", mappings);
    sendSuccess(res, 200, "Role Mappings Retrieved Successfully!", mappings);
  } catch (error) {
    console.error("Error fetching role mappings:", error);
    sendError(res, 500, "Internal Server Error while fetching role mappings!");
  }
};
