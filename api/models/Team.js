import mongoose, { Schema } from "mongoose";

// Define a new mongoose schema for a Team
const TeamSchema = new Schema(
  {
    // Define a field for the team's name
    teamName: {
      type: String,
      required: true, // The team name is required
      unique: true, // Team names must be unique
    },
    // Define a field for team members, which is an array of User references
    teamMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // References the "User" model
      },
    ],
    // Define a field for projects, which is an array of Project references
    projects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project", // References the "Project" model
      },
    ],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

// Export the mongoose model for the "Team" schema
export default mongoose.model("Team", TeamSchema);
