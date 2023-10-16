// Import the mongoose library to interact with MongoDB
import mongoose from "mongoose";
const { Schema } = mongoose;
/**
 * User Schema Definition
 *
 * Represents the blueprint for a user within the system.
 * The schema includes fields for basic user details, student-specific details, and professor-specific details.
 * Depending on the role of the user (Student, Professor), different fields may be relevant.
 */
const UserSchema = new Schema(
  {
    // Basic user details, common for all users in the system
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Array of roles associated with the user, references the "Role" model
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
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
    // Enable automatic indexing for the schema
    autoIndex: true,
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

// Middleware to handle user deletions.
// Before removing a user, it checks whether the user has any associated tickets.
// If the user has tickets, it throws an error. If not, it proceeds to remove the user from any teams they are part of.
UserSchema.pre("remove", async function (next) {
  try {
    // Fetch tickets either submitted by or assigned to this user
    const userTickets = await mongoose.model("Ticket").find({
      $or: [{ submittedByUser: this._id }, { assignedToUser: this._id }],
    });
    // If there are any associated tickets with the user, throw an error.
    if (userTickets.length > 0) {
      throw new Error(
        "User has associated tickets. Resolve those before deletion."
      );
    }

    // If there are no associated tickets, remove the user from any teams they are part of.
    await mongoose
      .model("Team")
      .updateMany(
        { teamMembers: this._id },
        { $pull: { teamMembers: this._id } }
      );

    next(); // Move to the next middleware or operation
  } catch (error) {
    next(error); // Pass the error to the next middleware or error handler
  }
});

// Middleware to handle changes to the user's teams.
// When the teams associated with a user change, this middleware checks any tickets submitted by the user.
// It ensures that the user's teams align with the project's teams.
UserSchema.pre("save", async function (next) {
  if (this.isModified("teams")) {
    // Fetch all active tickets submitted by this user
    const userTickets = await mongoose.model("Ticket").find({
      submittedByUser: this._id,
      state: { $in: ["New", "In Progress", "In QC", "Ready for QC"] },
    });
    // For each ticket, verify if the user's teams align with the project's teams.
    userTickets.forEach(async (ticket) => {
      const project = await mongoose.model("Project").findById(ticket.project);
      if (!this.teams.some((team) => project.teams.includes(team))) {
        // If none of the user's teams are in the project's teams
        // implemented in frontend.
      }
    });
  }
  next(); // Move to the next middleware or operation
});

// Export the User model for use in other parts of the application.
// The third argument explicitly sets the collection name in the MongoDB database to 'User'.
export default mongoose.model("User", UserSchema, "User");
