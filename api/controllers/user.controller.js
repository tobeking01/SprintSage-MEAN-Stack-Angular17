// Importing necessary libraries and modules.
import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Used for password hashing.
import User from "../models/User.js"; // User model.
import { CreateError } from "../utils/error.js"; // Utility to create error objects.
import { CreateSuccess } from "../utils/success.js"; // Utility to create success objects.
import Role from "../models/Role.js"; // Importing Role model.
// ... other imports ...

// Constant to represent the number of rounds that bcrypt will use when salting passwords.
// The higher the number, the more secure the hash, but the longer it will take to generate.
const SALT_ROUNDS = 10;

// Controller to create a new user.
export const createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, userName, email, password, role } = req.body;

    // Check for required fields.
    if (!role) return next(CreateError(400, "Role is required"));
    const userRole = await Role.findOne({ name: role });
    if (!userRole) return next(CreateError(400, "Invalid role"));
    if (!firstName || !lastName || !userName || !email || !password) {
      return next(CreateError(400, "All fields are required"));
    }

    // Validate email format.
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return next(CreateError(400, "Invalid email format"));
    }

    // Validate username format.
    const usernameRegex = /^[a-zA-Z0-9_\-]{3,30}$/;
    if (!userName.match(usernameRegex)) {
      return next(CreateError(400, "Invalid username format"));
    }

    // Hash the user password.
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Construct the user object.
    const newUser = {
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
      roles: [userRole._id],
    };

    // Check for role-specific fields.
    if (role === "Student") {
      newUser.schoolYear = req.body.schoolYear;
      newUser.expectedGraduation = req.body.expectedGraduation;
    } else if (role === "Professor") {
      newUser.professorTitle = req.body.professorTitle;
      newUser.professorDepartment = req.body.professorDepartment;
    }

    const user = new User(newUser);
    await user.save();

    // Prepare user for response (excluding password).
    const responseUser = user.toObject();
    delete responseUser.password;
    res
      .status(201)
      .json(CreateSuccess(201, "User Created Successfully!", responseUser));
  } catch (error) {
    next(CreateError(400, error.message));
  }
};

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
    if (!user) return next(CreateError(404, "User not found"));

    // Preparing the user object to be sent in the response.
    const responseUser = user.toObject();
    delete responseUser.password; // Removing the password from the response object.

    // Sending the success response.
    res
      .status(200)
      .json(CreateSuccess(200, "User Updated Successfully!", responseUser));
  } catch (error) {
    // Sending error response.
    next(
      CreateError(
        error instanceof mongoose.Error.ValidationError ? 400 : 500,
        error.message
      )
    );
  }
};

// deleteUser
// Controller function for deleting an existing user.
// - Receives the user ID from the request parameters.
// - Finds the user by ID and deletes it.

// Controller function to handle the retrieval of all users with pagination
export const getAllUsers = async (req, res, next) => {
  try {
    // Validate and sanitize limit and page number from the query parameters.
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
    const page = Math.max(1, parseInt(req.query.page) || 1);

    // Retrieve users from the database with pagination.
    const users = await User.find()
      .limit(limit)
      .skip((page - 1) * limit);

    // If there are no users in the database, return a 404 error.
    if (!users.length) return next(CreateError(404, "No users found!"));

    // Calculate total users and total pages for response metadata.
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    // Send a response containing users and pagination metadata.
    return res.json(
      CreateSuccess(200, "All Users", {
        users,
        metadata: {
          totalUsers,
          totalPages,
          currentPage: page,
          hasNextPage: totalPages > page,
          hasPreviousPage: page > 1,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching users:", error); // Log error details for debugging
    return next(CreateError(500, "Internal Server Error!")); // Send a 500 error for any unexpected errors.
  }
};

// Controller function to handle the retrieval of a single user by their ID
export const getUserById = async (req, res, next) => {
  const { id } = req.params;

  // Validate the format of the provided user ID.
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(CreateError(400, "Invalid User ID!"));

  try {
    // Retrieve a user from the database using the provided ID.
    const user = await User.findById(id);

    // If no user is found with the provided ID, return a 404 error.
    if (!user) return next(CreateError(404, "User not found!"));

    // If a user is found, return the user in the response.
    return res.json(CreateSuccess(200, "Single User", user));
  } catch (error) {
    console.error(`Error fetching user with ID ${id} :`, error); // Log error details for debugging
    return next(CreateError(500, "Internal Server Error!")); // Send a 500 error for any unexpected errors.
  }
};

// delete UserById
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return next(CreateError(404, "User not found"));

    res.status(200).json(CreateSuccess(200, "User Deleted Successfully!"));
  } catch (error) {
    next(CreateError(500, error.message));
  }
};

// Controller to update a user's profile based on their role (Student or Professor).
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { role } = req.user; // Assuming your authentication middleware sets this.

    // Check if user is updating their own profile.
    if (req.user._id !== userId) {
      return next(
        CreateError(
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
        CreateError(400, "Unrecognized user role. Cannot update profile.")
      );
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return next(CreateError(404, "User not found."));
    }

    // Respond with the updated user.
    res.json(
      CreateSuccess(200, "User Profile Updated Successfully!", updatedUser)
    );
  } catch (error) {
    console.error("Error updating user profile:", error);
    next(CreateError(500, "Error updating user profile."));
  }
};
