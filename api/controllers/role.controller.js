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

export const initializeRoles = async () => {
  try {
    const rolesToInitialize = ["Student", "Professor", "Admin"];
    for (const roleName of rolesToInitialize) {
      const existingRole = await Role.findOne({ name: roleName });

      // If role does not exist, create it
      if (!existingRole) {
        await Role.create({ name: roleName });
        console.log(`${roleName} role created successfully.`);
      } else {
        console.log(`${roleName} role already exists.`);
      }
    }
  } catch (error) {
    // Log any errors encountered during the initialization of the roles
    console.error("Error creating/checking roles:", error);
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
