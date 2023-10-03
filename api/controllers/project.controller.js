// Import the Project model to interact with the "Project" collection in the database.
import Project from "../models/Project.js";
import { CreateError } from "../utils/error.js";
import { CreateSuccess } from "../utils/success.js";
import User from "../models/User.js";
import Team from "../models/Team.js";
import Role from "../models/Role.js";
import Ticket from "../models/Ticket.js"; // Import the Ticket model at the top of your file

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
    const { projectName, description, teams, tickets, startDate, endDate } =
      req.body;

    // Validate project name
    if (
      !projectName ||
      typeof projectName !== "string" ||
      projectName.trim() === ""
    ) {
      return next(CreateError(400, "Project name is missing or invalid."));
    }

    // Validate teams. Check if each ID in the teams array corresponds to an existing Team in the database.
    if (teams && !Array.isArray(teams)) {
      return next(CreateError(400, "Teams must be an array."));
    }
    // Validate the existence of all team IDs in one query
    const countTeams = await Team.countDocuments({ _id: { $in: teams } });
    if (countTeams !== teams.length) {
      return next(CreateError(400, "One or more teams are invalid."));
    }
    for (let teamId of teams) {
      const team = await Team.findById(teamId);
      if (!team)
        return next(CreateError(400, `Team with ID ${teamId} does not exist.`));
    }

    // Further validations can be added as needed.

    const newProject = new Project({
      projectName,
      description: description || "Default Description",
      startDate: startDate || new Date(),
      endDate: endDate || new Date(),
      teams: teams || [],
      tickets: tickets || [],
    });

    await newProject.save();
    res.status(201).json(CreateSuccess(201, "Project Created!", newProject));
  } catch (error) {
    console.error("Error creating project:", error);
    next(CreateError(500, "Internal Server Error!"));
  }
};

// Controller to get all projects with pagination.
// Controller to get all projects with pagination.
export const getAllProjects = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Default limit is 10 items per page.
    const skip = parseInt(req.query.skip) || 0; // Default is the first page.

    // Get the total count of projects in the database
    const totalProjects = await Project.countDocuments();

    const projects = await Project.find()
      .skip(skip)
      .limit(limit)
      .populate("teams")
      .populate("tickets");

    // Calculate total pages and the current page for pagination metadata
    const totalPages = Math.ceil(totalProjects / limit);
    const currentPage = Math.floor(skip / limit) + 1;

    // Respond with projects data and the pagination metadata
    res.status(200).json({
      status: 200,
      message: "Projects fetched successfully!",
      data: projects,
      pagination: {
        total: totalProjects, // Total number of projects
        limit, // Number of projects per page
        skip, // Number of projects skipped
        totalPages, // Total number of pages
        currentPage, // Current page number
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    next(CreateError(500, "Internal Server Error!"));
  }
};

// Controller to get a specific project by its ID.
// Controller to get a specific project by its ID.
export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate("teams") // populating teams
      .populate("tickets"); // populating tickets

    if (!project) return next(CreateError(404, "Project not found!"));

    res
      .status(200)
      .json(CreateSuccess(200, "Project fetched successfully!", project));
  } catch (error) {
    console.error("Error fetching project:", error);
    next(CreateError(500, "Internal Server Error!"));
  }
};

// Controller to update a specific project by its ID.
export const updateProjectById = async (req, res, next) => {
  try {
    const { id } = req.params; // Extract the ID from the URL Params

    // Validate IDs of teams and tickets if they are in the request body.
    if (req.body.teams) {
      const countTeams = await Team.countDocuments({
        _id: { $in: req.body.teams },
      });
      if (countTeams !== req.body.teams.length) {
        return next(CreateError(400, "One or more teams are invalid."));
      }
    }

    if (req.body.tickets) {
      const countTickets = await Ticket.countDocuments({
        _id: { $in: req.body.tickets },
      });
      if (countTickets !== req.body.tickets.length) {
        return next(CreateError(400, "One or more tickets are invalid."));
      }
    }

    const projectUpdates = { ...req.body };

    // If required, you can further validate that each id in the teams and tickets arrays is a valid ObjectId,
    // and corresponds to an existing Team or Ticket document in the database.

    // Find by ID and Update
    const updatedProject = await Project.findByIdAndUpdate(id, projectUpdates, {
      new: true, // Return the updated document
    });

    // Check if the Project was found and updated
    if (!updatedProject) return next(CreateError(404, "Project not found!"));

    res
      .status(200)
      .json(
        CreateSuccess(200, "Project updated successfully!", updatedProject)
      );
  } catch (error) {
    console.error("Error updating project:", error); // Log the error for debugging purposes
    next(CreateError(500, "Internal Server Error!"));
  }
};

// Controller to delete a specific project by its ID.
export const deleteProjectById = async (req, res, next) => {
  try {
    const { id } = req.params; // Extract project ID from route parameters.
    const deletedProject = await Project.findByIdAndDelete(id); // Delete the project by ID.

    if (!deletedProject) return next(CreateError(404, "Project not found!"));

    res
      .status(200)
      .json(
        CreateSuccess(200, "Project deleted successfully!", deletedProject)
      );
  } catch (error) {
    console.error("Error deleting project:", error); // Log the error for debugging.
    next(CreateError(500, "Internal Server Error!"));
  }
};
