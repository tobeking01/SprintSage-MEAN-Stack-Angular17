// user.controller.js
import mongoose from "mongoose";
import User from "../models/User.js";
import { CreateError } from "../utils/error.js";
import { CreateSuccess } from "../utils/success.js";

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
