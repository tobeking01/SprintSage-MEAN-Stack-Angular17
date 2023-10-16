// Import the necessary module to interact with MongoDB using Mongoose
import mongoose from "mongoose";
const { Schema } = mongoose;

// Define the schema for the "Team" collection
const TeamSchema = new Schema(
  {
    // The name of the team, ensuring it's unique across all teams
    teamName: {
      type: String,
      unique: true,
      required: true,
    },
    // List of members in the team. Each member is a reference to a user in the "User" collection
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // ref userIDs for team
      },
    ], // user who created the Team
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // List of projects associated with the team. Each project is a reference to an entry in the "Project" collection
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project", // ref projectIDs for team
      },
    ],
  },
  {
    // Automatically generate "createdAt" and "updatedAt" timestamps for each team entry
    timestamps: true,
    // Enable automatic indexing for better performance
    autoIndex: true,
  }
);

// Middleware to ensure that when a team is deleted,
// its association is also removed from all projects it was linked with
TeamSchema.pre("remove", async function (next) {
  try {
    // Remove the team's ID from the teams list of every project it was associated with
    await mongoose
      .model("Project")
      .updateMany({ teams: this._id }, { $pull: { teams: this._id } });
    next();
  } catch (err) {
    next(err); // Pass any errors to the error-handling middleware
  }
});

// Method to add a user to the team, ensuring there are no duplicates
TeamSchema.methods.addUser = async function (userId) {
  // Check if the user is already a member of the team
  const isAlreadyAMember = this.teamMembers.some(
    (id) => id.toString() === userId.toString()
  );

  if (!isAlreadyAMember) {
    // If not, add the user to the team and save
    this.teamMembers.addToSet(userId);
    const user = await mongoose.model("User").findById(userId);
    user.teams.push(this._id);

    await this.save();
    await user.save();
  }
};

// Method to remove a user from the team
TeamSchema.methods.removeUser = async function (userId) {
  const index = this.teamMembers.indexOf(userId);
  if (index > -1) {
    this.teamMembers.pull(userId);
    await this.save();
  }
};

// Method to associate a project with the team, ensuring there are no duplicates
TeamSchema.methods.addProject = async function (projectId) {
  const isAlreadyAssociated = this.projects.some(
    (id) => id.toString() === projectId.toString()
  );

  if (!isAlreadyAssociated) {
    this.projects.addToSet(projectId);
    await this.save();
  }
};

// Method to disassociate a project from the team
TeamSchema.methods.removeProject = async function (projectId) {
  const index = this.projects.indexOf(projectId);
  if (index > -1) {
    this.projects.pull(projectId);
    await this.save();
  }
};

// Export the defined schema as the "Team" model for use in other parts of the application.
// The third argument "Team" ensures that the collection name in MongoDB is "Team".
export default mongoose.model("Team", TeamSchema, "Team");
