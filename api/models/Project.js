// Import required modules from the mongoose library
import mongoose, { Schema } from "mongoose";
import TicketState from "./TicketState.js";

/**
 * Defines the schema for the Project model in the application.
 *
 * A project in this context represents a collection of related tasks, teams, and descriptions.
 * Each project has a start and end date, a name, and associated teams and tickets.
 *
 * The schema allows us to create, read, update, and delete projects and their associated data.
 */
const ProjectSchema = new Schema(
  {
    projectName: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "", // Default value added
    },
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    tickets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
      },
    ],
    startDate: {
      type: Date,
      default: new Date(), // Default value added
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    autoIndex: true,
  }
);

ProjectSchema.path("endDate").validate(function (value) {
  if (this.startDate && value) {
    return this.startDate <= value;
  }
  return true;
}, "The end date must be after or the same as the start date.");

ProjectSchema.pre("remove", async function (next) {
  try {
    // Remove associated tickets
    const ticketIds = await this.model("Ticket")
      .find({ projectId: this._id })
      .select("_id");
    await this.model("Ticket").deleteMany({ projectId: this._id });

    // Remove associated audit logs
    await TicketState.deleteMany({ ticketId: { $in: ticketIds } });
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Project", ProjectSchema);
