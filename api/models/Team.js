// Import the mongoose library to enable database interactions
// and its Schema object for easier schema creation
import mongoose, { Schema } from "mongoose";

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
      unique: true, // Enforces that team names are distinct across all teams
    },

    // An array of team members, which are references to users.
    // Each entry in the array points to a user who is a member of the team.
    teamMembers: [
      {
        type: Schema.Types.ObjectId, // This is a special ID data type in mongoose to reference other models
        ref: "User", // Points to the "User" model, indicating that a team member is a User
      },
    ],

    // An array of projects associated with the team.
    // Each entry in the array references a project that the team is working on.
    projects: [
      {
        type: Schema.Types.ObjectId, // The reference ID data type
        ref: "Project", // Points to the "Project" model, indicating the associated projects of the team
      },
    ],
  },
  {
    // Enable automatic generation of 'createdAt' and 'updatedAt' timestamps.
    // 'createdAt' indicates when the team was formed, and 'updatedAt' indicates the last update time.
    timestamps: true,
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
export default mongoose.model("Team", TeamSchema);
