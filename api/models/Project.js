// Import the necessary module to interact with MongoDB using Mongoose
import mongoose from "mongoose";
const { Schema } = mongoose;

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
          // Reference to a user document
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
// ProjectSchema.pre("remove", async function (next) {
//   try {
//     // If you had logic to delete associated tickets when a project is deleted, it would be here
//     // Example: Removing all tickets associated with this project
//     // const tickets = await mongoose.model("Ticket").find({ project: this._id });
//     // for (let ticket of tickets) {
//     //   await ticket.remove();
//     // }

//     // Remove the association of this project from all teams it was linked to
//     await Team.updateMany(
//       { projects: this._id },
//       { $pull: { projects: this._id } }
//     );

//     next();
//   } catch (error) {
//     next(error); // Pass any errors to the error-handling middleware
//   }
// });

// // Middleware to handle changes to a project's associated teams
// ProjectSchema.pre("save", async function (next) {
//   if (this.isModified("teams")) {
//     const projectTickets = await mongoose.model("Ticket").find({
//       project: this._id,
//       state: { $in: ["New", "In Progress", "In QC", "Ready for QC"] },
//     });

//     projectTickets.forEach(async (ticket) => {
//       // If the ticket's user is not part of any of the new project teams
//       const user = await mongoose
//         .model("User")
//         .findById(ticket.user);
//       if (!user.teams.some((team) => this.teams.includes(team))) {
//         // Logic to notify the user, team, or the project manager about this ticket would go here
//       }
//     });
//   }
//   next();
// });

// Export the defined schema as the "Project" model for use in other parts of the application
// The third argument "Project" ensures that the collection name in MongoDB is "Project"
export default mongoose.model("Project", ProjectSchema, "Project");
