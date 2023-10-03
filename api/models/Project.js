// Import required modules from the mongoose library
import mongoose, { Schema } from "mongoose";

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
    // The name of the project, which must be unique within the system
    projectName: {
      type: String,
      required: true, // The project name is mandatory
      unique: true, // The project name must be distinct across all projects
    },
    // A brief summary or details about the project
    description: {
      type: String,
    },
    // List of teams associated with the project. This sets up a relation with the Team model
    teams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Team", // Reference to the Team model
      },
    ],
    // List of tickets or tasks linked to the project. This sets up a relation with the Ticket model
    tickets: [
      {
        type: Schema.Types.ObjectId,
        ref: "Ticket", // Reference to the Ticket model
      },
    ],
    // The starting date of the project
    startDate: {
      type: Date,
    },
    // The anticipated ending date of the project
    endDate: {
      type: Date,
    },
  },
  {
    // Enables automatic tracking of createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * Middleware to perform actions before removing a Project document from the database.
 *
 * Specifically, before a project is deleted, this function will delete all tickets associated
 * with the project, ensuring data integrity and preventing orphaned ticket documents.
 */
ProjectSchema.pre("remove", async function (next) {
  // Delete all tickets where the projectId matches the current project's ID
  await this.model("Ticket").deleteMany({ projectId: this._id });
  next();
});

// Export the mongoose model based on the Project schema for use in the application
export default mongoose.model("Project", ProjectSchema);
