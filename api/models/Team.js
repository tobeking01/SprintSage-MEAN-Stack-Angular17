// Import the necessary module to interact with MongoDB using Mongoose
import mongoose from "mongoose";
const { Schema } = mongoose;

// TeamSchema definition
const TeamSchema = new Schema(
  {
    // Unique name of the team
    teamName: {
      type: String,
      unique: true,
      required: true,
    },
    // Array of team members with their added date
    teamMembers: [
      {
        user: {
          // Reference to a user document
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        addedDate: {
          // Timestamp for when the user was added
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Array of associated projects with their added date
    projects: [
      {
        project: {
          // Reference to a project document
          type: mongoose.Schema.Types.ObjectId,
          ref: "Project",
        },
        addedDate: {
          // Timestamp for when the project was associated
          type: Date,
          default: Date.now,
        },
      },
    ], // Reference to the user who created the team
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Set to required if every team must have a creator
    },
  },
  {
    // Auto-generate creation and update timestamps
    timestamps: true,
    // Enable automatic indexing
    autoIndex: true,
  }
);

// Method to add a user to the team
TeamSchema.methods.addUser = async function (userId) {
  const isAlreadyAMember = this.teamMembers.some(
    (member) => member.user.toString() === userId.toString()
  );

  // If user is not already a member, add them
  if (!isAlreadyAMember) {
    this.teamMembers.addToSet({ user: userId, addedDate: new Date() });
    // Just save the team since we're not modifying the user directly in this method
    await this.save();
  }
};

// Method to remove a user from the team
TeamSchema.methods.removeUser = async function (userId) {
  const memberIndex = this.teamMembers.findIndex(
    (member) => member.user.toString() === userId.toString()
  );
  if (memberIndex > -1) {
    this.teamMembers.splice(memberIndex, 1);
    await this.save();
  }
};

// Method to associate a project with the team
TeamSchema.methods.addProject = async function (projectId) {
  const isAlreadyAssociated = this.projects.some(
    (project) => project.project.toString() === projectId.toString()
  );

  // If the project is not already associated, add it
  if (!isAlreadyAssociated) {
    this.projects.addToSet({ project: projectId, addedDate: new Date() });
    await this.save();
  }
};

// Method to disassociate a project from the team
TeamSchema.methods.removeProject = async function (projectId) {
  const projectIndex = this.projects.findIndex(
    (project) => project.project.toString() === projectId.toString()
  );
  if (projectIndex > -1) {
    this.projects.splice(projectIndex, 1);
    await this.save();
  }
};

// Exporting the TeamSchema as the "Team" model
export default mongoose.model("Team", TeamSchema, "Team");
