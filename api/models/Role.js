import mongoose from "mongoose";

// Defining a schema for the Role data model using mongoose.
// The Role model is used to define the different user roles within the system
// such as Admin, User, and SuperUser. Each role has different levels of access
// and permissions throughout the application.
const RoleSchema = mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true, // Ensures that each role is unique within the system
      enum: ["Admin", "User", "SuperUser"], // Defines the available roles within the system
    },
  },
  {
    timestamps: true, // Enables the automatic tracking of when entries are created or updated
  }
);

// Exporting the Role model.
// The model creates a 'Role' collection in the database using the defined schema and
// allows for interaction with the Role data throughout the application.
export default mongoose.model("Role", RoleSchema);
