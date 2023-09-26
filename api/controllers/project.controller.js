// Import the Project model to interact with the "Project" collection in the database.
import Project from "../models/Project.js";
import { CreateError } from "../utils/error.js";
import { CreateSuccess } from "../utils/success.js";

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
    // Extract project data from request body.
    const { projectName } = req.body;

    // Validate project data.
    if (
      !projectName ||
      typeof projectName !== "string" ||
      projectName.trim() === ""
    ) {
      return next(CreateError(400, "Invalid project data."));
    }

    // Create and save the new Project instance to the database.
    const newProject = new Project({ projectName });
    await newProject.save();

    // Respond with a success message.
    res.status(201).json(CreateSuccess(201, "Project Created!", newProject));
  } catch (error) {
    console.error("Error creating project:", error); // Log the error for debugging.
    next(CreateError(500, "Internal Server Error!")); // Forward the error to the error handling middleware.
  }
};

// Controller to get all projects.
export const getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find(); // Fetch all projects from the database.
    res
      .status(200)
      .json(CreateSuccess(200, "Projects fetched successfully!", projects));
  } catch (error) {
    console.error("Error fetching projects:", error); // Log the error for debugging.
    next(CreateError(500, "Internal Server Error!"));
  }
};

// Controller to get a specific project by its ID.
export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params; // Extract project ID from route parameters.
    const project = await Project.findById(id); // Fetch the project from the database by ID.

    if (!project) return next(CreateError(404, "Project not found!"));

    res
      .status(200)
      .json(CreateSuccess(200, "Project fetched successfully!", project));
  } catch (error) {
    console.error("Error fetching project:", error); // Log the error for debugging.
    next(CreateError(500, "Internal Server Error!"));
  }
};

// Controller to update a specific project by its ID.
export const updateProjectById = async (req, res, next) => {
  try {
    // Extracting the project ID from the request parameters.
    const { id } = req.params;

    // Updating the project in the database and returning the new project document.
    // { new: true } ensures that the updated document is returned.
    const updatedProject = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    // If the project does not exist, return a 404 error.
    if (!updatedProject) return next(CreateError(404, "Project not found!"));

    // Respond with the updated project document.
    res
      .status(200)
      .json(
        CreateSuccess(200, "Project updated successfully!", updatedProject)
      );
  } catch (error) {
    // Log any errors that occur during the updating of the project.
    console.error("Error updating project:", error);

    // Forward a 500 Internal Server Error to the error handling middleware.
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
