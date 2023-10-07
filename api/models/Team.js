// Import the mongoose library to enable database interactions
import mongoose, { Schema } from "mongoose";
import Project from "./Project.js";
import User from "./User.js"; // Add this import

/**
 * Team Schema Definition
 *
 * Represents the blueprint for a team within the system.
 * Each team has a unique name, a list of team members, and the projects they are associated with.
 */
const TeamSchema = new Schema(
  {
    // The unique name associated with the team
    teamName: {
      type: String,
      unique: true,
      required: true,
    },

    // An array of team members, which are references to users.
    // Each entry in the array points to a user who is a member of the team.
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId, // This is a special ID data type in mongoose to reference other models
        ref: "User", // Points to the "User" model, indicating that a team member is a User
      },
    ],
  },
  {
    // Enable automatic generation of 'createdAt' and 'updatedAt' timestamps.
    // 'createdAt' indicates when the team was formed, and 'updatedAt' indicates the last update time.
    timestamps: true, // Enable automatic indexing for the schema
    autoIndex: true,
  }
);

/**
 * Team Model Definition
 *
 * With the defined TeamSchema, this model facilitates interactions
 * with the Team data in the database. Operations like creating a team,
 * listing teams, updating team information, etc., can be performed using this model.
 *
 * Note: In MongoDB, the collection will be named 'teams' due to mongoose's pluralization behavior.
 */

TeamSchema.pre("remove", async function (next) {
  try {
    await Project.updateMany(
      { teams: this._id },
      { $pull: { teams: this._id } }
    );
    next();
  } catch (err) {
    next(err);
  }
});

TeamSchema.methods.addUser = async function (userId) {
  // Check if user is already a member of this team
  const isAlreadyAMember = this.teamMembers.some(
    (id) => id.toString() === userId.toString()
  );

  // If not already a member, add to the team
  if (!isAlreadyAMember) {
    this.teamMembers.push(userId);

    // Optionally, update the user document to reflect this association if needed
    const user = await User.findById(userId);
    // Update user's document with the relevant data, for example:
    // user.teams.push(this._id);

    // Save both documents
    await this.save();
    await user.save();
  }
};

TeamSchema.methods.removeUser = async function (userId) {
  const index = this.teamMembers.indexOf(userId);
  if (index > -1) {
    this.teamMembers.splice(index, 1);
    await this.save();
  }
};

export default mongoose.model("Team", TeamSchema);
