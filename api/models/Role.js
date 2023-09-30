import mongoose from "mongoose";

// Defining a schema for the Role data model using mongoose.
// The Role model is used to define the different user roles within the system
// such as Admin, Professor, and Student. Each role has different levels of access
// and permissions throughout the application.
const RoleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["Admin", "Professor", "Student"], // Adjust the values according to your design.
      required: true,
    },
  },
  {
    timestamps: true, // Enables the automatic tracking of when entries are created or updated
  }
);

// Exporting the Role model.
// The model creates a 'Role' collection in the database using the defined schema and
// allows for interaction with the Role data throughout the application.
const Role = mongoose.model("Role", RoleSchema);

export default Role;
