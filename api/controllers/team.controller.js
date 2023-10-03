import Team from "../models/Team.js";
import { CreateError } from "../utils/error.js";
import { CreateSuccess } from "../utils/success.js";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const handlePopulation = (query, req) => {
  if (req.query.populate === "true") {
    return query.populate("teamMembers").populate("projects");
  }
  return query;
};

/**
 * @async
 * @function createTeam
 * @description Controller to create a new team.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
// create teams
export const createTeam = async (req, res, next) => {
  const { teamName, teamMembers, projects } = req.body;

  // Validate the format and content of teamMembers.
  if (
    !Array.isArray(teamMembers) ||
    teamMembers.some((id) => !isValidObjectId(id))
  ) {
    return next(CreateError(400, "Invalid team members."));
  }

  // Check if any of the members are already in another team.
  const membersInAnotherTeam = await Team.findOne({
    teamMembers: { $in: teamMembers },
  });

  if (membersInAnotherTeam) {
    return next(
      CreateError(400, `One or more members are already in another team.`)
    );
  }

  // If projects are provided, validate their format and content.
  if (
    projects &&
    (!Array.isArray(projects) || projects.some((id) => !isValidObjectId(id)))
  ) {
    return next(CreateError(400, "Invalid projects."));
  }

  if (projects) {
    const projectInAnotherTeam = await Team.findOne({
      projects: { $in: projects },
    });

    if (projectInAnotherTeam) {
      return next(
        CreateError(
          400,
          `One or more projects are already associated with another team.`
        )
      );
    }
  }

  const newTeam = new Team({ teamName, teamMembers, projects });
  await newTeam.save();

  res.status(201).json(CreateSuccess(201, "Team Created!", newTeam));
};

// get all teams
export const getAllTeams = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const searchQuery = {};
    if (req.query.name) {
      searchQuery.teamName = new RegExp(req.query.name, "i");
    }
    if (req.query.memberId) {
      searchQuery.teamMembers = mongoose.Types.ObjectId(req.query.memberId);
    }

    const query = Team.find(searchQuery).skip(skip).limit(limit);
    const teams = await handlePopulation(query, req).exec();

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

    if (!isValidObjectId(id)) {
      return next(CreateError(400, "Invalid ID format."));
    }

    const query = Team.findById(id);
    const team = await handlePopulation(query, req).exec();

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
