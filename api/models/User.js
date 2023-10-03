import mongoose from "mongoose";
// Define the User schema for MongoDB using Mongoose
const UserSchema = new mongoose.Schema(
  {
    // Basic user details
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],

    // Student-specific fields
    schoolYear: { type: String },
    expectedGraduation: { type: Date },

    // Professor-specific fields
    professorTitle: { type: String },
    professorDepartment: { type: String },
  },
  // Add timestamps for created and updated dates
  { timestamps: true }
);
// Create a model from the schema
const User = mongoose.model("User", UserSchema);

export default User;
