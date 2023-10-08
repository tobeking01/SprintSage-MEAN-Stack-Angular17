// Import the Project model to interact with the "Project" collection in the database.
import Project from "../models/Project.js";
import Team from "../models/Team.js";
import Ticket from "../models/Ticket.js"; // Import the Ticket model at the top of your file
import { sendError, sendSuccess } from "../utils/createResponse.js";

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
    const {
      projectName,
      description = "Default Description",
      teams = [],
      tickets = [],
      startDate = new Date(),
      endDate = new Date(),
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

    // Validate teams. Ensure they are valid IDs and exist in the database.
    if (!Array.isArray(teams)) {
      return sendError(res, 400, "Teams must be an array.");
    }
    const validTeams = await Team.find({ _id: { $in: teams } });
    if (validTeams.length !== teams.length) {
      return sendError(res, 400, "One or more teams are invalid.");
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return sendError(res, 400, "Invalid start or end date format.");
    }

    if (tickets && Array.isArray(tickets)) {
      const validTickets = await Ticket.find({ _id: { $in: tickets } });
      if (validTickets.length !== tickets.length) {
        return sendError(res, 400, "One or more tickets are invalid.");
      }
    }

    const newProject = new Project({
      projectName,
      description,
      startDate,
      endDate,
      teams,
      tickets,
    });
    await newProject.save();

    sendSuccess(res, 201, "Project Created!", [newProject]);
  } catch (error) {
    console.error("Error creating project:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

// Function to validate date format
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// Controller to get all projects
export const getAllProjects = async (req, res, next) => {
  try {
    // Find projects and populate the "teams" field, as well as "teamMembers" within each team
    const projects = await Project.find().populate({
      path: "teams",
      populate: {
        path: "teamMembers",
        model: "User",
      },
    });

    if (!projects.length) {
      console.warn("Warning: No projects found!"); // Logging the absence of projects
      return sendError(res, 404, "No projects found!");
    }

    console.info(`Fetched all projects successfully.`); // Logging success in retrieval

    sendSuccess(res, 200, "Projects fetched successfully!", projects);
  } catch (error) {
    console.error("Error fetching projects:", error); // Detailed error logging
    return next(sendError(res, 500, "Internal Server Error!"));
  }
};

// Controller to get a specific project by its ID.
export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate({
        path: "teams",
        populate: {
          path: "teamMembers",
          model: "User",
        },
      })
      .populate("tickets");

    if (!project) {
      return sendError(res, 404, "Project not found!");
    }

    sendSuccess(res, 200, "Project fetched successfully!", [project]);
  } catch (error) {
    console.error("Error fetching project:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

export const updateProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const projectUpdates = { ...req.body };

    const existingProject = await Project.findById(id);
    if (!existingProject) {
      return sendError(res, 404, "Project not found!");
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
export const deleteProjectById = async (req, res, next) => {
  try {
    const { id } = req.params; // Extract project ID from route parameters.
    const deletedProject = await Project.findByIdAndDelete(id); // Delete the project by ID.

    if (!deletedProject) return next(sendError(res, 404, "Project not found!"));

    return sendSuccess(res, 200, "Project deleted successfully!", [
      deletedProject,
    ]);
  } catch (error) {
    console.error("Error deleting project:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};
