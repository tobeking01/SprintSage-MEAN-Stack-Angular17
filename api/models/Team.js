import mongoose, { Schema } from "mongoose";

// Models
import Project from "./Project.js";
import User from "./User.js";

const TeamSchema = new Schema(
  {
    teamName: {
      type: String,
      unique: true,
      required: true,
    },
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  },
  {
    timestamps: true,
    autoIndex: true,
  }
);

// Middleware to handle the removal of a team and its associated references in Project model
TeamSchema.pre("remove", async function (next) {
  try {
    await Project.updateMany(
      { teams: this._id },
      { $pull: { teams: this._id } }
    );
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to add a user to the team
TeamSchema.methods.addUser = async function (userId) {
  const isAlreadyAMember = this.teamMembers.some(
    (id) => id.toString() === userId.toString()
  );

  if (!isAlreadyAMember) {
    this.teamMembers.push(userId);

    // If you have a reference in the User model to keep track of teams
    // const user = await User.findById(userId);  // Uncomment this if needed
    // user.teams.push(this._id);  // Uncomment this line if there's a teams array in User model

    await this.save();
    // await user.save(); // Also uncomment this line if updating User
  }
};

// Instance method to remove a user from the team
TeamSchema.methods.removeUser = async function (userId) {
  const index = this.teamMembers.indexOf(userId);
  if (index > -1) {
    this.teamMembers.splice(index, 1);
    await this.save();
  }
};

// Instance method to add a project to the team
TeamSchema.methods.addProject = async function (projectId) {
  const isAlreadyAssociated = this.projects.some(
    (id) => id.toString() === projectId.toString()
  );

  if (!isAlreadyAssociated) {
    this.projects.push(projectId);
    await this.save();
  }
};

// Instance method to remove a project from the team
TeamSchema.methods.removeProject = async function (projectId) {
  const index = this.projects.indexOf(projectId);
  if (index > -1) {
    this.projects.splice(index, 1);
    await this.save();
  }
};

export default mongoose.model("Team", TeamSchema);
