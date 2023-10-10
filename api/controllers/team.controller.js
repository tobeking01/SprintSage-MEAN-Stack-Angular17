import Team from "../models/Team.js";
import Project from "../models/Project.js";
import { sendError, sendSuccess } from "../utils/createResponse.js";
import mongoose from "mongoose";
import User from "../models/User.js";
const ObjectId = mongoose.Types.ObjectId;

const validateObjectIds = (ids) => {
  return ids.every((id) => mongoose.Types.ObjectId.isValid(id));
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const createTeam = async (req, res, next) => {
  const { teamName, teamMembers } = req.body;

  // Check if teamName is provided
  if (!teamName) {
    return sendError(res, 400, "Team name is required.");
  }

  // Check if teamName already exists (assuming Team has a unique constraint on teamName)
  const existingTeam = await Team.findOne({ teamName });
  if (existingTeam) {
    return sendError(res, 400, "Team name already exists.");
  }

  // Validate the Object IDs
  if (!validateObjectIds(teamMembers)) {
    return sendError(
      res,
      400,
      "Invalid team members. Check the format of member IDs."
    );
  }

  try {
    const users = await User.find({ _id: { $in: teamMembers } });
    if (users.length !== teamMembers.length) {
      return sendError(
        res,
        400,
        "One or more team members are not valid users."
      );
    }

    const newTeam = new Team({ teamName, teamMembers });
    await newTeam.save();
    // When a new team is created, ensure the response contains the team in an array. important!!!
    sendSuccess(res, 201, "Team Created!", [newTeam]);
  } catch (error) {
    console.error("Error creating team:", error);
    return sendError(res, 500, "Internal Server Error");
  }
};

export const getAllTeams = async (req, res, next) => {
  try {
    const searchQuery = {};

    if (req.query.name) {
      searchQuery.teamName = new RegExp(req.query.name, "i");
    }

    if (req.query.memberId) {
      searchQuery.teamMembers = mongoose.Types.ObjectId(req.query.memberId);
    }

    const teams = await Team.find(searchQuery).populate("teamMembers");
    sendSuccess(res, 200, "Teams fetched successfully!", teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

export const getTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid ID format.");
    }

    const team = await Team.findById(id).populate([
      "teamMembers",
      {
        path: "projects",
        model: "Project",
      },
    ]);

    if (!team) return sendError(res, 404, "Team not found!");

    sendSuccess(res, 200, "Team fetched successfully!", [team]);
  } catch (error) {
    console.error("Error fetching team:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

export const getTeamsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return sendError(res, 400, "Invalid User ID format.");
    }

    const teams = await Team.find({
      teamMembers: new ObjectId(userId),
    })
      .populate("teamMembers")
      .populate({
        path: "projects",
        model: "Project",
      });

    if (!teams.length) {
      return sendError(res, 404, "No teams found for this user.");
    }

    sendSuccess(res, 200, "Teams fetched successfully!", teams);
  } catch (error) {
    console.error("Error fetching teams by user ID:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

export const updateTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const allowedUpdates = ["teamName", "teamMembers"];

    const isValidOperation = Object.keys(updates).every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
      return sendError(res, 400, "Invalid updates!");
    }

    const updatedTeam = await Team.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate("teamMembers");

    if (!updatedTeam) return sendError(res, 404, "Team not found!");
    // When a new team is created, ensure the response contains the team in an array.
    sendSuccess(res, 200, "Team updated successfully!", [updatedTeam]);
  } catch (error) {
    console.error("Error updating team:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

export const deleteTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedTeam = await Team.findByIdAndDelete(id);
    if (!deletedTeam) return sendError(res, 404, "Team not found!");
    // When a new team is created, ensure the response contains the team in an array.
    sendSuccess(res, 200, "Team deleted successfully!", [deletedTeam]);
  } catch (error) {
    console.error("Error deleting team:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

export const removeUserFromTeam = async (req, res, next) => {
  try {
    const { teamId, userId } = req.params;

    if (!isValidObjectId(teamId) || !isValidObjectId(userId)) {
      return sendError(res, 400, "Invalid ID format.");
    }

    const team = await Team.findById(teamId);
    if (!team) return sendError(res, 404, "Team not found!");

    // Assuming teamMembers is an array of ObjectIds
    const index = team.teamMembers.indexOf(userId);
    if (index > -1) {
      team.teamMembers.splice(index, 1);
      await team.save();
    } else {
      return sendError(res, 400, "User not found in the team.");
    }

    sendSuccess(res, 200, "User removed from team successfully!", [team]);
  } catch (error) {
    console.error("Error removing user from team:", error);
    sendError(res, 500, error.message);
  }
};

export const addUserToTeam = async (req, res, next) => {
  try {
    const { teamId, userId } = req.params;

    // Validate ObjectIds
    if (!isValidObjectId(teamId) || !isValidObjectId(userId)) {
      return sendError(res, 400, "Invalid ID format.");
    }

    // Check for the existence of User
    const user = await User.findById(userId);
    if (!user) return sendError(res, 404, "User not found!");

    // Check for the existence of Team
    const team = await Team.findById(teamId);
    if (!team) return sendError(res, 404, "Team not found!");

    // Check if user is already part of the team
    if (team.teamMembers.includes(userId)) {
      return sendError(res, 400, "User already in the team.");
    }

    // Add user to the team
    team.teamMembers.push(userId);
    await team.save();

    sendSuccess(res, 200, "User added to team successfully!", [team]);
  } catch (error) {
    console.error("Error adding user to team:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

// Controller to get teams by a specific project ID.
export const getTeamByProjectId = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Find project by ID to get its associated teams
    const project = await Project.findById(projectId).populate("teams");

    if (!project) {
      return sendError(res, 404, "Project not found.");
    }

    // Check if project has teams
    if (!project.teams || project.teams.length === 0) {
      return sendError(res, 404, "No teams associated with this project.");
    }

    // Now, fetch team details
    const teams = await Team.find({ _id: { $in: project.teams } }).populate(
      "teamMembers"
    );

    return sendSuccess(res, 200, "Teams fetched successfully!", teams);
  } catch (error) {
    console.error("Error fetching teams by project ID:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

// Controller to get projects by a specific team ID.
export const getProjectsByTeamId = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    // Find team by ID to get its associated projects
    const team = await Team.findById(teamId).populate("projects");

    if (!team) {
      return sendError(res, 404, "Team not found.");
    }

    // Check if team has projects
    if (!team.projects || team.projects.length === 0) {
      return sendError(res, 404, "No projects associated with this team.");
    }

    return sendSuccess(
      res,
      200,
      "Projects fetched successfully!",
      team.projects
    );
  } catch (error) {
    console.error("Error fetching projects by team ID:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};
