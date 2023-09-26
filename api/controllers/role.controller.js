// role.controller.js

// Importing the Role model to interact with the 'Role' collection in the database.
import Role from "../models/Role.js";

// Importing utility functions to create standardized error and success responses.
import { CreateError } from "../utils/error.js";
import { CreateSuccess } from "../utils/success.js";

/**
 * Utility function to validate the role.
 * Checks if the role is a non-empty string.
 * @param {string} role - The role to validate.
 * @returns {boolean} - Returns true if the role is valid, else false.
 */
const isValidRole = (role) => typeof role === "string" && role.trim() !== "";

/**
 * Controller to create a new role.
 * Validates the role and, if valid, saves it to the database.
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const createRole = async (req, res, next) => {
  try {
    // Extract role from request body.
    const { role } = req.body;

    // Validate the extracted role using the utility function.
    if (!isValidRole(role)) return next(CreateError(400, "Invalid role data."));

    // Create and save the new Role instance to the database.
    const newRole = new Role({ role });
    await newRole.save();

    // Respond with a success message.
    res.status(201).json(CreateSuccess(201, "Role Created!"));
  } catch (error) {
    console.error("Error creating role:", error); // Log the error for debugging.
    next(CreateError(500, "Internal Server Error!")); // Forward the error to the error handling middleware.
  }
};

/**
 * Controller to update an existing role by its ID.
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const updateRole = async (req, res, next) => {
  try {
    // Find the role by its ID.
    const role = await Role.findById(req.params.id);

    // If no such role exists, return an error.
    if (!role) return next(CreateError(404, "Role not found!"));

    // Update the found role and respond with a success message.
    await Role.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(CreateSuccess(200, "Role Updated!"));
  } catch (error) {
    console.error("Error updating role:", error); // Log the error for debugging.
    next(CreateError(500, "Internal Server Error!")); // Forward the error to the error handling middleware.
  }
};

/**
 * Controller to retrieve all roles from the database.
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const getAllRoles = async (req, res, next) => {
  try {
    // Retrieve all roles from the database.
    const roles = await Role.find({});

    // Respond with the retrieved roles.
    res
      .status(200)
      .json(CreateSuccess(200, "Roles fetched successfully!", roles));
  } catch (error) {
    console.error("Error fetching roles:", error); // Log the error for debugging.
    next(CreateError(500, "Internal Server Error!")); // Forward the error to the error handling middleware.
  }
};

/**
 * Controller to delete an existing role by its ID.
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const deleteRole = async (req, res, next) => {
  try {
    // Find the role by its ID.
    const role = await Role.findById(req.params.id);

    // If no such role exists, return an error.
    if (!role) return next(CreateError(404, "Role not found!"));

    // Delete the found role and respond with a success message.
    await Role.findByIdAndDelete(req.params.id);
    res.status(200).json(CreateSuccess(200, "Role deleted!"));
  } catch (error) {
    console.error("Error deleting role:", error); // Log the error for debugging.
    next(CreateError(500, "Internal Server Error!")); // Forward the error to the error handling middleware.
  }
};
