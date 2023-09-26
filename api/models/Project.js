import mongoose, { Schema } from "mongoose";

// Define a new mongoose schema for a Project
const ProjectSchema = new Schema(
  {
    // Define a field for the project's name
    projectName: {
      type: String,
      required: true, // The project name is required
      unique: true, // Project names must be unique
    },
    // Define a field for teams, which is an array of Team references
    teams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Team", // References the "Team" model
      },
    ],
    // Define a field for tickets, which is an array of Ticket references
    tickets: [
      {
        type: Schema.Types.ObjectId,
        ref: "Ticket", // References the "Ticket" model
      },
    ],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

// Export the mongoose model for the "Project" schema
export default mongoose.model("Project", ProjectSchema);
