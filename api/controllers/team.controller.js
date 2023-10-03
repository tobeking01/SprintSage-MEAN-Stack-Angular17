// Importing necessary modules and utilities
import Team from "../models/Team.js";
import { sendError, sendSuccess } from "../utils/responseUtility.js";
import mongoose from "mongoose";

// Utility function to check if a given string is a valid MongoDB Object ID
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Utility function to handle the population of certain fields if requested
const handlePopulation = (query, req) => {
  if (req.query.populate === "true") {
    return query.populate("teamMembers").populate("projects");
  }
  return query;
};

/**
 * Controller to create a new team.
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */

// Controller to create a new team
export const createTeam = async (req, res, next) => {
  const { teamName, teamMembers, projects } = req.body;

  // Validate teamMembers to ensure they are valid ObjectIDs
  if (
    !Array.isArray(teamMembers) ||
    teamMembers.some((id) => !isValidObjectId(id))
  ) {
    return sendError(res, 400, "Invalid team members.");
  }

  // Check if team members are already part of another team
  const membersInAnotherTeam = await Team.findOne({
    teamMembers: { $in: teamMembers },
  });
  if (membersInAnotherTeam) {
    return sendError(
      res,
      400,
      `One or more members are already in another team.`
    );
  }

  // If provided, validate the projects to ensure they are valid ObjectIDs
  if (
    projects &&
    (!Array.isArray(projects) || projects.some((id) => !isValidObjectId(id)))
  ) {
    return sendError(400, "Invalid projects.");
  }

  // Check if the projects are already associated with another team
  if (projects) {
    const projectInAnotherTeam = await Team.findOne({
      projects: { $in: projects },
    });
    if (projectInAnotherTeam) {
      return sendError(
        res,
        400,
        `One or more projects are already associated with another team.`
      );
    }
  }

  // Create a new team and save it to the database
  const newTeam = new Team({ teamName, teamMembers, projects });
  await newTeam.save();
  sendSuccess(201, "Team Created!", newTeam);
};

// Controller to fetch all teams, with optional pagination and filtering
export const getAllTeams = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const searchQuery = {};
    if (req.query.name) {
      // Case-insensitive search for team name
      searchQuery.teamName = new RegExp(req.query.name, "i");
    }
    if (req.query.memberId) {
      searchQuery.teamMembers = mongoose.Types.ObjectId(req.query.memberId);
    }

    // Construct and execute the query to fetch the teams
    const query = Team.find(searchQuery).skip(skip).limit(limit);
    const teams = await handlePopulation(query, req).exec();
    sendSuccess(200, "Teams fetched successfully!", teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    const errorResponse = sendError(500, "Internal Server Error!");
    next(errorResponse);
  }
};

// Controller to fetch a specific team by its ID
export const getTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid ID format.");
    }

    const query = Team.findById(id);
    const team = await handlePopulation(query, req).exec();
    if (!team) return sendSuccess(404, "Team not found!");

    sendSuccess(200, "Team fetched successfully!", team);
  } catch (error) {
    console.error("Error fetching team:", error);
    const errorResponse = sendError(500, "Internal Server Error!");
    next(errorResponse);
  }
};

// Controller to update a team by its ID
export const updateTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const allowedUpdates = ["teamName", "teamMembers", "projects"];

    // Validate that only permissible fields are being updated
    const isValidOperation = Object.keys(updates).every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
      return sendError(400, "Invalid updates!");
    }

    // Update the team in the database
    const updatedTeam = await Team.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .populate("teamMembers")
      .populate("projects");
    if (!updatedTeam) return sendError(404, "Team not found!");

    sendSuccess(200, "Team updated successfully!", updatedTeam);
  } catch (error) {
    console.error("Error updating team:", error);
    const errorResponse = sendError(500, "Internal Server Error!");
    next(errorResponse);
  }
};

// Controller to delete a team by its ID
export const deleteTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedTeam = await Team.findByIdAndDelete(id);
    if (!deletedTeam) return sendError(404, "Team not found!");
    sendSuccess(200, "Team deleted successfully!", deletedTeam);
  } catch (error) {
    console.error("Error deleting team:", error);
    const errorResponse = sendError(500, "Internal Server Error!");
    next(errorResponse);
  }
};
