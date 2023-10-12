// role.controller.js

// Importing the Role model to interact with the 'Role' collection in the database.
import Role from "../models/Role.js";
import User from "../models/User.js"; // Assuming User model is in the models directory

// Importing utility functions to create standardized error and success responses.
import { sendError, sendSuccess } from "../utils/createResponse.js";

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
    // Define the list of default roles to be initialized.
    const rolesToInitialize = ["Student", "Professor", "Admin"];

    for (const roleName of rolesToInitialize) {
      const existingRole = await Role.findOne({ name: roleName });

      // If the role does not already exist, create it.
      if (!existingRole) {
        await Role.create({ name: roleName });
        console.log(`[Initialization] ${roleName} role created.`);
      } else {
        console.log(`[Initialization] ${roleName} role already exists.`);
      }
    }
  } catch (error) {
    console.error("[Initialization Error] Error initializing roles:", error);
    sendError(res, 500, "Internal Server Error!");
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
    const { name } = req.body;

    if (!isValidRole(name)) {
      return sendError(res, 400, "Invalid role!");
    }

    // Check if a role with the desired update name already exists.
    const existingRoleWithName = await Role.findOne({ name });
    if (
      existingRoleWithName &&
      String(existingRoleWithName._id) !== String(req.params.id)
    ) {
      return sendError(res, 400, "Role name already exists!");
    }

    const role = await Role.findById(req.params.id);
    if (!role) return next(sendError(res, 404, "Role not found!"));

    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    sendSuccess(res, 200, "Role Updated!", updatedRole);
  } catch (error) {
    console.error("Error updating role:", error);
    sendError(res, 500, "Internal Server Error!");
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
    sendSuccess(res, 200, "Roles fetched successfully!", roles);
  } catch (error) {
    console.error("Error fetching roles:", error); // Log the error for debugging.
    sendError(res, 500, "Internal Server Error!");
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
    const role = await Role.findById(req.params.id);

    if (!role) return next(sendError(res, 404, "Role not found!"));

    // Example: Assuming you have a User model with a role field
    const userWithRole = await User.findOne({ role: req.params.id });
    if (userWithRole) {
      return sendError(res, 400, "Role is still in use and cannot be deleted!");
    }

    await Role.findByIdAndDelete(req.params.id);
    sendSuccess(res, 200, "Role deleted!");
  } catch (error) {
    console.error("Error deleting role:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};
