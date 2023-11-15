// Import the necessary module to interact with MongoDB using Mongoose
import mongoose from "mongoose";
const { Schema } = mongoose;
import Team from "./Team.js";
import Ticket from "./Ticket.js";
// Define the schema for the "Project" collection
const ProjectSchema = new Schema(
  {
    // Name of the project, ensuring uniqueness across all projects
    projectName: {
      type: String,
      required: true,
      unique: true,
    },
    // List of tickets associated with the project
    tickets: [
      {
        ticket: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ticket",
        },
        addedDate: {
          // Timestamp for when the user was added
          type: Date,
          default: Date.now,
        },
      },
    ], // user who created the project
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Start date for the project with default as the current date
    startDate: {
      type: Date,
      default: new Date(),
    },
    // Optional end date for the project
    endDate: {
      type: Date,
    },
  },
  {
    // Automatically generate "createdAt" and "updatedAt" timestamps for each project entry
    timestamps: true,
    // Enable automatic indexing for better performance
    autoIndex: true,
  }
);

// Validate that the end date is after the start date if both are provided
ProjectSchema.path("endDate").validate(function (value) {
  if (this.startDate && value) {
    return this.startDate <= value;
  }
  return true;
}, "The end date must be after or the same as the start date.");

// Middleware to handle cascading deletions when a project is removed
ProjectSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const project = this;

      // Log the project tickets to verify they're populated correctly
      console.log("Project tickets before deletion:", project.tickets);

      // Iterate over each ticket ObjectId in the project's tickets array
      for (let ticketRef of project.tickets) {
        // ticketRef directly contains the ObjectId, use ticketRef._id
        // Use deleteOne method to ensure that pre and post hooks of Ticket model are triggered
        const deletionResult = await Ticket.deleteOne({ _id: ticketRef._id });
        console.log(
          `Ticket deletion result for ${ticketRef._id}:`,
          deletionResult
        );
      }

      // Update Teams - remove this project from teams that are associated with it
      await Team.updateMany(
        { projects: { $elemMatch: { project: project._id } } },
        { $pull: { projects: { project: project._id } } }
      );

      next();
    } catch (err) {
      console.error("Error in pre-delete middleware for Project:", err);
      next(err);
    }
  }
);

ProjectSchema.pre("save", async function (next) {
  if (this.isModified("tickets")) {
    // Assuming "tickets" modification is relevant
    try {
      const projectTickets = await mongoose.model("Ticket").find({
        project: this._id,
        state: { $in: ["New", "In Progress", "In QC", "Ready for QC"] },
      });

      // Using Promise.all to handle all asynchronous operations concurrently
      await Promise.all(
        projectTickets.map(async (ticket) => {
          const user = await mongoose.model("User").findById(ticket.user);
          // Your existing logic here...
        })
      );

      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Export the defined schema as the "Project" model for use in other parts of the application
// The third argument "Project" ensures that the collection name in MongoDB is "Project"
export default mongoose.model("Project", ProjectSchema, "Project");
