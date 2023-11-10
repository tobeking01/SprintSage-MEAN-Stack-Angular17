// Import the Project model to interact with the "Project" collection in the database.
import Project from "../models/Project.js";
import mongoose from "mongoose";
import Team from "../models/Team.js";
import Ticket from "../models/Ticket.js"; // Import the Ticket model at the top of your file
import { sendError, sendSuccess } from "../utils/createResponse.js";

// validate date format
const isValidDate = (startDateString, endDateString) => {
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);
  return (
    !isNaN(startDate.getTime()) &&
    !isNaN(endDate.getTime()) &&
    startDate <= endDate
  );
};

export const getProjectByIdHelper = async (projectId) => {
  try {
    const project = await Project.findById(projectId)
      .populate({
        path: "createdBy",
        model: "User",
        select: "firstName lastName userName roles",
        populate: {
          path: "roles",
          model: "Role",
          select: "name",
        },
      })
      .populate({
        path: "tickets.ticket",
        model: "Ticket",
      })
      .exec();

    if (!project) {
      console.warn("Project not found for ID:", projectId);
      return null;
    }

    const teams = await Team.find({ "projects.project": projectId })
      .populate({
        path: "teamMembers.user",
        model: "User",
        select: "firstName lastName userName roles",
        populate: {
          path: "roles",
          model: "Role",
          select: "name",
        },
      })
      .select("teamName teamMembers");

    project.set("teams", teams, { strict: false });

    return project;
  } catch (error) {
    console.error("Error fetching project in helper:", error);
    throw error;
  }
};

// Good with model change
/**
 * Controller to create a new project.
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */

// Controller to create a new project.
export const createProject = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return sendError(res, 401, "Authentication required.");
    }

    const {
      projectName,
      tickets = [],
      startDate = new Date(),
      endDate = new Date(),
      teamId,
    } = req.body;

    if (
      !projectName ||
      typeof projectName !== "string" ||
      projectName.trim() === ""
    ) {
      return sendError(res, 400, "Project name is missing or invalid.");
    }

    const existingProject = await Project.findOne({ projectName });
    if (existingProject) {
      return sendError(res, 400, "A project with this name already exists.");
    }

    if (tickets && Array.isArray(tickets)) {
      const validTickets = await Ticket.find({ _id: { $in: tickets } });
      if (validTickets.length !== tickets.length) {
        return sendError(res, 400, "One or more tickets are invalid.");
      }
    }
    if (!isValidDate(startDate, endDate)) {
      return sendError(
        res,
        400,
        "Invalid start or end date format, or start date is after end date."
      );
    }

    // Constructing the tickets data for the project schema
    const ticketsForProject = tickets.map((ticketId) => ({
      ticket: ticketId,
      addedDate: new Date(),
    }));

    const newProject = new Project({
      projectName,
      startDate,
      endDate,
      tickets: ticketsForProject,
      createdBy: req.user.id,
    });
    await newProject.save();

    // Check if teamId is provided and is valid
    if (teamId) {
      const team = await mongoose.model("Team").findById(teamId);
      if (team) {
        await team.addProject(newProject._id);
        sendSuccess(
          res,
          201,
          `Project '${newProject.projectName}' Created and Associated with Team '${team.teamName}'!`,
          newProject
        );
      } else {
        await newProject.remove(); // Removing the project as the team association failed
        sendError(res, 404, `Team not found with ID: ${teamId}`);
      }
    } else {
      sendSuccess(
        res,
        201,
        `Project '${newProject.projectName}' Created Successfully!`,
        newProject
      );
    }
  } catch (error) {
    console.error("Error creating project:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

/**
 * Controller to get a specific project by its ID.
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Use the helper function to get the project enriched with teams and their members
    const project = await getProjectByIdHelper(id);

    if (!project) {
      return sendError(res, 404, "Project not found!");
    }

    return sendSuccess(res, 200, "Project fetched successfully!", project);
  } catch (error) {
    console.error("Error fetching project:", error);
    sendError(res, 500, "Internal Server Error!");
    next(error); // Pass the error to a potential error-handling middleware
  }
};

// keep
export const getProjectsByUserId = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id.toString();

    if (!loggedInUserId) return sendError(res, 404, "User not found!");

    // Fetch teams where the logged-in user is a member
    const userTeams = await Team.find({
      "teamMembers.user": new mongoose.Types.ObjectId(loggedInUserId),
    });

    let projectIds = [];

    if (userTeams.length) {
      // Extract project IDs from the user's teams using 'reduce'
      projectIds = userTeams.reduce((acc, team) => {
        const teamProjectIds = team.projects.map((p) => p.project.toString());
        return [...acc, ...teamProjectIds];
      }, []);
    }

    // Fetch projects associated with the logged-in user's teams
    const projects = await Project.find({
      _id: { $in: projectIds },
    }).populate("createdBy");

    // Return the projects
    sendSuccess(res, 200, "Projects fetched successfully!", projects);
  } catch (error) {
    console.error(
      "Error fetching projects for user:",
      loggedInUserId,
      "Error:",
      error
    );
    sendError(res, 500, "Internal Server Error!");
  }
};

// function
export const updateProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const projectUpdates = { ...req.body };

    const existingProject = await Project.findById(id);
    if (!existingProject) {
      return sendError(res, 404, "Project not found!");
    }
    // Ensure only the project's creator or an admin can update it
    if (existingProject.createdBy.toString() !== req.user.id.toString()) {
      return sendError(
        res,
        403,
        "Access denied! Only the project creator can update this project."
      );
    }
    // Validate projectName for uniqueness
    if (projectUpdates.projectName) {
      const duplicateProject = await Project.findOne({
        projectName: projectUpdates.projectName,
        _id: { $ne: id },
      });
      if (duplicateProject) {
        return sendError(res, 400, "A project with this name already exists.");
      }
      existingProject.projectName = projectUpdates.projectName;
    }

    // Validate teams and tickets IDs if provided
    if (projectUpdates.teams) {
      const countTeams = await Team.countDocuments({
        _id: { $in: projectUpdates.teams },
      });
      if (countTeams !== projectUpdates.teams.length) {
        return sendError(res, 400, "One or more teams are invalid.");
      }
      existingProject.teams = projectUpdates.teams;
    }

    if (projectUpdates.tickets) {
      const countTickets = await Ticket.countDocuments({
        _id: { $in: projectUpdates.tickets },
      });
      if (countTickets !== projectUpdates.tickets.length) {
        return sendError(res, 400, "One or more tickets are invalid.");
      }
      existingProject.tickets = projectUpdates.tickets;
    }
    if (projectUpdates.description) {
      existingProject.description = projectUpdates.description;
    }

    if (
      projectUpdates.startDate &&
      projectUpdates.endDate &&
      !isValidDate(projectUpdates.startDate, projectUpdates.endDate)
    ) {
      return sendError(
        res,
        400,
        "Invalid start or end date format, or start date is after end date."
      );
    }

    if (projectUpdates.startDate) {
      existingProject.startDate = new Date(projectUpdates.startDate);
    }
    if (projectUpdates.endDate) {
      existingProject.endDate = new Date(projectUpdates.endDate);
    }
    await existingProject.save();

    return sendSuccess(res, 200, "Project updated successfully!", [
      existingProject,
    ]);
  } catch (error) {
    console.error("Error updating project:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

// Controller to delete a specific project by its ID.
export const deleteProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const projectId = new mongoose.Types.ObjectId(id); // Ensure the ID is a valid ObjectId

    // Find the project first to make sure it exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).send({ message: "Project not found!" });
    }

    // Use deleteOne method to trigger the pre 'deleteOne' middleware
    // which will handle the deletion of associated tickets and the updating of teams
    await project.deleteOne();

    return res.status(200).send({ message: "Project deleted successfully!" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).send({ message: "Internal Server Error!" });
  }
};

/**
 * Controller to add members to a project via teams.
 *
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const addTeamsToProject = async (req, res, next) => {
  try {
    // Extract project ID from route parameters and team IDs from the request body.
    const { id } = req.params;
    const { teamIds } = req.body;

    // Check if teamIds is an array.
    if (!Array.isArray(teamIds)) {
      return sendError(res, 400, "Team IDs must be an array.");
    }

    // Fetch teams from the database that match the provided team IDs.
    const teams = await Team.find({ _id: { $in: teamIds } });
    const validTeamIds = teams.map((team) => team._id.toString());

    // Identify any provided team IDs that are invalid.
    const invalidIds = teamIds.filter(
      (teamId) => !validTeamIds.includes(teamId.toString())
    );
    if (invalidIds.length > 0) {
      return sendError(
        res,
        400,
        `The following team IDs are invalid: ${invalidIds.join(", ")}`
      );
    }

    // Fetch the existing project by its ID.
    const existingProject = await Project.findById(id);
    if (!existingProject) {
      return sendError(res, 404, "Project not found!");
    }

    // Ensure that only the project's creator or an admin can add members to the project.
    if (existingProject.createdBy.toString() !== req.user.id.toString()) {
      return sendError(
        res,
        403,
        "Access denied! Only the project creator can add members to this project."
      );
    }

    // Add valid team IDs to the project, avoiding duplicates.
    validTeamIds.forEach((validTeamId) => {
      if (!existingProject.teams.some((team) => team.equals(validTeamId))) {
        existingProject.teams.push(validTeamId);
      }
    });

    // Save changes to the project.
    await existingProject.save();

    // Respond with a success message.
    return sendSuccess(
      res,
      200,
      "Teams (and their members) added to project successfully!",
      existingProject
    );
  } catch (error) {
    // Log and respond with any errors.
    console.error("Error adding teams to project:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

/**
 * Controller to remove a member from a project.
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const removeMemberFromProject = async (req, res, next) => {
  try {
    const { id: projectId, memberId: userId } = req.params;

    // Find all teams working on this project.
    const teams = await Team.find({ "projects.project": projectId });

    if (teams.length === 0) {
      return sendError(res, 404, "No teams are assigned to this project.");
    }

    let isMemberRemoved = false;
    for (let team of teams) {
      if (
        team.teamMembers.some(
          (member) => member.user.toString() === userId.toString()
        )
      ) {
        await team.removeUser(userId);
        isMemberRemoved = true;
        // Break if you assume a user can only be in one team per project
        break;
      }
    }

    if (!isMemberRemoved) {
      return sendError(
        res,
        400,
        "User is not a member of any team in this project."
      );
    }

    return sendSuccess(res, 200, "User removed from project successfully!");
  } catch (error) {
    console.error("Error removing user from project:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};
