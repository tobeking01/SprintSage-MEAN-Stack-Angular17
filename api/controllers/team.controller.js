import Team from "../models/Team.js";
import { CreateError } from "../utils/error.js";
import { CreateSuccess } from "../utils/success.js";
import mongoose from "mongoose";

/**
 * @async
 * @function createTeam
 * @description Controller to create a new team.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */

export const createTeam = async (req, res, next) => {
  // Destructure relevant fields from the request body.
  const { teamName, teamMembers, projects } = req.body;

  // Validate the format and content of teamMembers.
  // Ensure each member's ID is a valid MongoDB ObjectId.
  if (
    !Array.isArray(teamMembers) ||
    teamMembers.some(
      (id) => typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)
    )
  ) {
    return next(CreateError(400, "Invalid team members."));
  }

  // Iterate over teamMembers to ensure no member is already part of another team.
  for (const memberId of teamMembers) {
    const userExistsInAnotherTeam = await Team.exists({
      teamMembers: memberId,
    });
    if (userExistsInAnotherTeam) {
      return next(
        CreateError(400, `User with id ${memberId} is already in another team.`)
      );
    }
  }

  // If projects are provided, validate their format and content.
  // Ensure each project's ID is a valid MongoDB ObjectId and not associated with another team.
  if (
    projects &&
    (!Array.isArray(projects) ||
      projects.some(
        (id) => typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)
      ))
  ) {
    return next(CreateError(400, "Invalid projects."));
  }

  for (const projectId of projects || []) {
    const projectExistsInAnotherTeam = await Team.exists({
      projects: projectId,
    });
    if (projectExistsInAnotherTeam) {
      return next(
        CreateError(
          400,
          `Project with id ${projectId} is already associated with another team.`
        )
      );
    }
  }

  // Instantiate a new Team with the provided details and save to the database.
  const newTeam = new Team({ teamName, teamMembers, projects });
  await newTeam.save();

  res.status(201).json(CreateSuccess(201, "Team Created!", newTeam));
};
export const getAllTeams = async (req, res, next) => {
  try {
    // Implementing pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Implementing search by team name or member
    const searchQuery = {};
    if (req.query.name) {
      searchQuery.teamName = new RegExp(req.query.name, "i");
    }
    if (req.query.memberId) {
      searchQuery.teamMembers = mongoose.Types.ObjectId(req.query.memberId);
    }

    // Allow clients to decide whether to populate data
    const populateData = req.query.populate === "true";
    const query = Team.find(searchQuery).skip(skip).limit(limit);
    if (populateData) {
      query.populate("teamMembers").populate("projects");
    }

    const teams = await query.exec();

    res
      .status(200)
      .json(CreateSuccess(200, "Teams fetched successfully!", teams));
  } catch (error) {
    console.error("Error fetching teams:", error);
    next(CreateError(500, "Internal Server Error!"));
  }
};

// Get team by Id method
export const getTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(CreateError(400, "Invalid ID format."));
    }

    const team = await Team.findById(id)
      .populate("teamMembers")
      .populate("projects");

    if (!team) return next(CreateError(404, "Team not found!"));

    res
      .status(200)
      .json(CreateSuccess(200, "Team fetched successfully!", team));
  } catch (error) {
    console.error("Error fetching team:", error);
    next(CreateError(500, "Internal Server Error!"));
  }
};

// update team by Id
export const updateTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const allowedUpdates = ["teamName", "teamMembers", "projects"];
    const isValidOperation = Object.keys(updates).every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return next(CreateError(400, "Invalid updates!"));
    }

    const updatedTeam = await Team.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .populate("teamMembers")
      .populate("projects");

    if (!updatedTeam) return next(CreateError(404, "Team not found!"));

    res
      .status(200)
      .json(CreateSuccess(200, "Team updated successfully!", updatedTeam));
  } catch (error) {
    console.error("Error updating team:", error);
    next(CreateError(500, "Internal Server Error!"));
  }
};

// delete team by Id
export const deleteTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedTeam = await Team.findByIdAndDelete(id);

    if (!deletedTeam) return next(CreateError(404, "Team not found!"));

    res
      .status(200)
      .json(CreateSuccess(200, "Team deleted successfully!", deletedTeam));
  } catch (error) {
    console.error("Error deleting team:", error);
    next(CreateError(500, "Internal Server Error!"));
  }
};
