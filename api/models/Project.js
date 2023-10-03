import mongoose, { Schema } from "mongoose";

// Define a new mongoose schema for a Project
const ProjectSchema = new Schema(
  {
    projectName: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
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
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Cascade Delete Tickets when a project is deleted
ProjectSchema.pre("remove", async function (next) {
  await this.model("Ticket").deleteMany({ projectId: this._id });
  next();
});

// Export the mongoose model for the "Project" schema
export default mongoose.model("Project", ProjectSchema);
