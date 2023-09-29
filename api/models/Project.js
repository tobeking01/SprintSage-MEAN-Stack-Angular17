import mongoose, { Schema } from "mongoose";

// Define a new mongoose schema for a Project
const ProjectSchema = new Schema(
  {
    projectName: {
      type: String,
      required: true,
      unique: true,
    },
    // Add a new field for the project's description
    description: {
      type: String,
      required: true, // You can set this to true if you want the description to be mandatory.
    },
    // Add new fields for the project's start and end dates
    startDate: {
      type: Date,
      required: true, // Assuming that the start date is required
    },
    endDate: {
      type: Date,
      required: true, // You can set this to true if you want the end date to be mandatory.
    },
    teams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    tickets: [
      {
        type: Schema.Types.ObjectId,
        ref: "Ticket",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Export the mongoose model for the "Project" schema
export default mongoose.model("Project", ProjectSchema);
