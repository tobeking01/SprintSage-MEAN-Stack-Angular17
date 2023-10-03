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
  try {
    console.log("Received Payload:", req.body);
    const { teamName, teamMembers, projects } = req.body;

    // other validations...

    // Validate teamMembers
    if (
      !Array.isArray(teamMembers) ||
      teamMembers.some(
        (id) => typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)
      )
    ) {
      return next(CreateError(400, "Invalid team members."));
    }

    // Optionally, validate the existence of team members in the database here.
    // Similar logic applies to projects.
    const User = mongoose.model("User"); // or however you import your User model

    for (const memberId of teamMembers) {
      const userExists = await User.exists({ _id: memberId });
      if (!userExists)
        return next(
          CreateError(400, `User with id ${memberId} does not exist.`)
        );
    }

    // similarly, validate projects if provided
    if (
      projects &&
      (!Array.isArray(projects) ||
        projects.some(
          (id) => typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)
        ))
    ) {
      return next(CreateError(400, "Invalid projects."));
    }

    const Project = mongoose.model("Project"); // or however you import your Project model
    for (const projectId of projects || []) {
      const projectExists = await Project.exists({ _id: projectId });
      if (!projectExists)
        return next(
          CreateError(400, `Project with id ${projectId} does not exist.`)
        );
    }

    const newTeam = new Team({ teamName, teamMembers, projects });
    await newTeam.save();
    res.status(201).json(CreateSuccess(201, "Team Created!", newTeam));
  } catch (error) {
    console.error("Error creating team:", error);
    next(CreateError(500, "Internal Server Error!"));
  }
};

/**
 * @async
 * @function getAllTeams
 * @description Controller to fetch all teams from the database.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const getAllTeams = async (req, res, next) => {
  try {
    // Fetching all teams from the database.
    const teams = await Team.find()
      .populate("teamMembers")
      .populate("projects");

    // Responding with the list of teams.
    res
      .status(200)
      .json(CreateSuccess(200, "Teams fetched successfully!", teams));
  } catch (error) {
    console.error("Error fetching teams:", error); // Log the error for debugging.
    next(CreateError(500, "Internal Server Error!")); // Forward the error to the error-handling middleware.
  }
};

/**
 * @async
 * @function getTeamById
 * @description Controller to fetch a specific team by its ID from the database.
 * ...
 * [Additional comments describing params, usage, etc.]
 */
export const getTeamById = async (req, res, next) => {
  try {
    const { id } = req.params; // Extracting the team ID from the route parameters.

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(CreateError(400, "Invalid ID format."));
    }
    // Fetching the team from the database by ID and populating references.
    const team = await Team.findById(id)
      .populate("teamMembers")
      .populate("projects");

    if (!team) return next(CreateError(404, "Team not found!"));

    // Responding with the fetched team.
    res
      .status(200)
      .json(CreateSuccess(200, "Team fetched successfully!", team));
  } catch (error) {
    console.error("Error fetching team:", error); // Log the error for debugging.
    next(CreateError(500, "Internal Server Error!")); // Forward the error to the error-handling middleware.
  }
};

/**
 * @async
 * @function updateTeamById
 * @description Controller to update a specific team by its ID in the database.
 * ...
 * [Additional comments describing params, usage, etc.]
 */
export const updateTeamById = async (req, res, next) => {
  try {
    const { id } = req.params; // Extracting the team ID from the route parameters.
    // Validate the input here
    const updates = req.body;
    const allowedUpdates = ["teamName", "teamMembers", "projects"]; // Replace with your actual field names
    const isValidOperation = Object.keys(updates).every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return next(CreateError(400, "Invalid updates!"));
    }
    // Updating the team in the database and returning the updated team document.
    const updatedTeam = await Team.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .populate("teamMembers")
      .populate("projects");

    if (!updatedTeam) return next(CreateError(404, "Team not found!"));

    // Responding with the updated team.
    res
      .status(200)
      .json(CreateSuccess(200, "Team updated successfully!", updatedTeam));
  } catch (error) {
    console.error("Error updating team:", error); // Log the error for debugging.
    next(CreateError(500, "Internal Server Error!")); // Forward the error to the error-handling middleware.
  }
};

/**
 * @async
 * @function deleteTeamById
 * @description Controller to delete a specific team by its ID from the database.
 * ...
 * [Additional comments describing params, usage, etc.]
 */
export const deleteTeamById = async (req, res, next) => {
  try {
    const { id } = req.params; // Extracting the team ID from the route parameters.

    // Deleting the team from the database by ID.
    const deletedTeam = await Team.findByIdAndDelete(id);

    if (!deletedTeam) return next(CreateError(404, "Team not found!"));

    // Responding with the deleted team.
    res
      .status(200)
      .json(CreateSuccess(200, "Team deleted successfully!", deletedTeam));
  } catch (error) {
    console.error("Error deleting team:", error); // Log the error for debugging.
    next(CreateError(500, "Internal Server Error!")); // Forward the error to the error-handling middleware.
  }
};
