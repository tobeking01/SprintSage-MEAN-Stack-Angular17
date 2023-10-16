// Import the mongoose library to define and manage the data model
import mongoose from "mongoose";

/**
 * Role Schema Definition
 *
 * This schema represents different user roles within the system.
 * For instance, users can be assigned roles such as Admin, Professor, or Student.
 * Depending on their assigned role, users may have varied access levels
 * and permissions throughout the application.
 */
const RoleSchema = mongoose.Schema(
  {
    // The name of the role.
    // It is limited to one of the three specified values: Admin, Professor, or Student.
    name: {
      type: String,
      enum: ["Admin", "Professor", "Student"], // Allowed values for the role name
      required: true, // The role name is mandatory for every Role document
    },
  },
  {
    // Enable automatic tracking of 'createdAt' and 'updatedAt' timestamps.
    // This provides metadata about when a role was initially added and
    // the last time it was updated in the database.
    timestamps: true,
    // Enable automatic indexing for the schema
    autoIndex: true,
  }
);

/**
 * Role Model Definition
 *
 * Using the RoleSchema, a mongoose model is defined for interacting with the Role data.
 * Once defined, the model allows operations such as creating, reading, updating,
 * and deleting Role documents from the database.
 *
 * Note: In the MongoDB database, this will appear as a 'roles' collection due to
 * mongoose's pluralization.
 */
const Role = mongoose.model("Role", RoleSchema);

// Export the Role model so it can be used elsewhere in the application.
export default Role;
