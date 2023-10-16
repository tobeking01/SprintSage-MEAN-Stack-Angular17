// Import the Project model to interact with the "Project" collection in the database.
import Project from "../models/Project.js";
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

// populate 1
const getProjectByIdHelper = async (id) => {
  return await Project.findById(id)
    .populate({
      path: "teams",
      populate: {
        path: "teamMembers",
        model: "User",
      },
    })
    .populate("tickets");
};

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

    if (!Array.isArray(teams)) {
      return sendError(res, 400, "Teams must be an array.");
    }
    const validTeams = await Team.find({ _id: { $in: teams } });
    if (validTeams.length !== teams.length) {
      return sendError(res, 400, "One or more teams are invalid.");
    }

    if (!isValidDate(startDate, endDate)) {
      return sendError(
        res,
        400,
        "Invalid start or end date format, or start date is after end date."
      );
    }

    if (tickets && Array.isArray(tickets)) {
      const validTickets = await Ticket.find({ _id: { $in: tickets } });
      if (validTickets.length !== tickets.length) {
        return sendError(res, 400, "One or more tickets are invalid.");
      }
    }
    const userIdsFromTeams = [];

    // Extract user IDs from the teams
    for (let team of validTeams) {
      if (team.teamMembers && Array.isArray(team.teamMembers)) {
        userIdsFromTeams.push(...team.teamMembers);
      } else {
        console.error("Invalid team members data for team:", team);
      }
    }

    const newProject = new Project({
      projectName,
      description,
      startDate,
      endDate,
      teams,
      users: userIdsFromTeams,
      tickets,
      createdBy: req.user.id,
    });
    await newProject.save();
    // Update teams with the new project ID
    for (let teamId of teams) {
      await Team.findByIdAndUpdate(teamId, {
        $push: { projects: newProject._id },
      });
    }

    sendSuccess(res, 201, "Project Created!", [newProject]);
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

    // Fetch the project and populate the createdBy field with both 'firstName' and 'lastName' from the User model
    const project = await Project.findById(id)
      .populate({
        path: "createdBy",
        select: "firstName lastName", // Only get the 'firstName' and 'lastName' fields
      })
      .populate({
        path: "teams",
        populate: {
          path: "teamMembers",
          select: "firstName lastName", // Only get the 'firstName' and 'lastName' of team members
        },
      });

    if (!project) {
      return sendError(res, 404, "Project not found!");
    }

    return sendSuccess(res, 200, "Project fetched successfully!", [project]);
  } catch (error) {
    console.error("Error fetching project:", error);
    sendError(res, 500, "Internal Server Error!");
    next(error); // Pass the error to a potential error-handling middleware
  }
};

export const getProjectsByUserId = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id.toString();

    // Step 1: Fetch teams that have Alice as a member
    const teamsWithUser = await Team.find({
      teamMembers: loggedInUserId,
    });

    const teamIds = teamsWithUser.map((team) => team._id);

    // Step 2: Fetch projects associated with those teams
    const projects = await Project.find({
      $or: [{ createdBy: loggedInUserId }, { teams: { $in: teamIds } }],
    }).populate({
      path: "teams",
      populate: {
        path: "teamMembers",
        model: "User",
      },
    });

    if (!projects.length) {
      return sendSuccess(
        res,
        200,
        "No projects found for the authenticated user.",
        []
      );
    }

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
    if (
      existingProject.createdBy.toString() !== req.user.id.toString() &&
      !(await isUserAdmin(req.user.id))
    ) {
      return sendError(
        res,
        403,
        "Access denied! Only the project creator or an admin can update this project."
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

    if (!isValidDate(projectUpdates.startDate, projectUpdates.endDate)) {
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
export const deleteProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const projectToDelete = await Project.findById(id);

    if (!projectToDelete) {
      return sendError(res, 404, "Project not found!");
    }

    // Ensure only the project's creator or an admin can delete it
    if (
      projectToDelete.createdBy.toString() !== req.user.id.toString() &&
      !(await isUserAdmin(req.user.id.toString()))
    ) {
      return sendError(
        res,
        403,
        "Access denied! Only the project creator or an admin can delete this project."
      );
    }

    await projectToDelete.remove();

    return sendSuccess(res, 200, "Project deleted successfully!", [
      projectToDelete,
    ]);
  } catch (error) {
    console.error("Error deleting project:", error);
    sendError(res, 500, "Internal Server Error!");
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
    if (
      existingProject.createdBy.toString() !== req.user.id.toString() &&
      !(await isUserAdmin(req.user.id.toString()))
    ) {
      return sendError(
        res,
        403,
        "Access denied! Only the project creator or an admin can add members to this project."
      );
    }

    // Add valid team IDs to the project, avoiding duplicates.
    validTeamIds.forEach((validTeamId) => {
      if (!existingProject.teams.includes(validTeamId)) {
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
      [existingProject]
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

    // Fetch the project by its ID.
    const project = await Project.findById(projectId);
    if (!project) {
      return sendError(res, 404, "Project not found!");
    }

    // Ensure that only the project's creator or an admin can remove members from the project.
    if (
      project.createdBy.toString() !== req.user.id.toString() &&
      !(await isUserAdmin(req.user.id.toString()))
    ) {
      return sendError(
        res,
        403,
        "Access denied! Only the project creator or an admin can remove members from this project."
      );
    }

    let isMemberRemoved = false;

    // Loop through the teams of the project
    for (let teamId of project.teams) {
      let team = await Team.findById(teamId);
      if (team && team.teamMembers.includes(userId)) {
        // Use the removeUser method from the Team schema to remove the user from the team
        await team.removeUser(userId);
        isMemberRemoved = true;
        break; // Assuming a user can only be in one team, we break after removing
      }
    }

    // If user is not found in any of the teams
    if (!isMemberRemoved) {
      return sendError(res, 400, "User is not a member of this project.");
    }

    // Respond with a success message.
    return sendSuccess(res, 200, "User removed from project successfully!");
  } catch (error) {
    // Log and respond with any errors.
    console.error("Error removing user from project:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};
