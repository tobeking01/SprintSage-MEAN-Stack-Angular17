// Import the mongoose library to interact with MongoDB
import mongoose from "mongoose";

/**
 * User Schema Definition
 *
 * Represents the blueprint for a user within the system.
 * The schema includes fields for basic user details, student-specific details, and professor-specific details.
 * Depending on the role of the user (Student, Professor), different fields may be relevant.
 */
const UserSchema = new mongoose.Schema(
  {
    // Basic user details, common for all users in the system
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Array of roles associated with the user, references the "Role" model
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],

    // Fields specific to users with the 'Student' role
    schoolYear: { type: String }, // Year or level of the student
    expectedGraduation: { type: Date }, // Expected date of graduation

    // Fields specific to users with the 'Professor' role
    professorTitle: { type: String }, // Title, e.g., "Assistant Professor"
    professorDepartment: { type: String }, // Department the professor belongs to
  },
  {
    // Enable the creation of 'createdAt' and 'updatedAt' timestamps.
    // 'createdAt' denotes when the user was registered, and 'updatedAt' indicates the last update time.
    timestamps: true,
  }
);

/**
 * User Model Definition
 *
 * Using the defined UserSchema, this model facilitates database operations related to users.
 * Actions like registering a new user, fetching user details, updating user information, etc.,
 * can be done using this model.
 *
 * Note: In MongoDB, the collection will be named 'users' due to mongoose's pluralization behavior.
 */
const User = mongoose.model("User", UserSchema);

export default User;
