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

// Utility function to check if a user is an admin.
const isUserAdmin = async (userId) => {
  const user = await User.findById(userId);
  return user && user.isAdmin;
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

    // Here we are setting the createdBy field using req.userId
    const newTeam = new Team({ teamName, teamMembers, createdBy: req.user.id });
    await newTeam.save();

    // Update each user's teams array with the new team's ID
    for (let userId of teamMembers) {
      await User.findByIdAndUpdate(userId, { $push: { teams: newTeam._id } });
    }

    // When a new team is created, ensure the response contains the team in an array.
    sendSuccess(res, 201, "Team Created!", [newTeam]);
  } catch (error) {
    console.error("Error creating team:", error);
    return sendError(res, 500, "Internal Server Error");
  }
};

export const getTeamsByProjectDetails = async (req, res, next) => {
  try {
    const projectId = String(req.query.projectId); // get projectId from frontend as string
    const loggedInUserId = req.user.id;

    if (!projectId) {
      return sendError(res, 400, "Project ID is required!");
    }

    if (!loggedInUserId) {
      return sendError(res, 401, "User not authenticated!");
    }

    const teams = await Team.find({
      projects: projectId,
      teamMembers: loggedInUserId, // Ensures the logged-in user is a member of the team.
    })
      .populate({
        path: "teamMembers",
        populate: {
          path: "roles",
          model: "Role", // Assuming 'Role' is the name of your role model
        },
      })
      .populate("projects");

    if (!teams.length) {
      return sendSuccess(res, 200, "No teams found for the given project.", []);
    }

    sendSuccess(res, 200, "Teams fetched successfully!", teams);
  } catch (error) {
    console.error("Error fetching teams by project:", error);
    sendError(res, 500, `Internal Server Error: ${error.message}`);
  }
};

// getall teams by user Id
export const getTeamsByUserId = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id.toString(); // endpoint to return teams for the currently authenticated user

    // If the user isn't found (which should be rare if they're authenticated), return a 404 error.
    if (!loggedInUserId) return sendError(res, 404, "User not found!");

    const teams = await Team.find({
      $or: [{ createdBy: loggedInUserId }, { teamMembers: loggedInUserId }],
    }).populate("teamMembers");

    if (!teams.length) {
      return sendSuccess(
        res,
        200,
        "No teams found for the authenticated user.",
        []
      );
    }

    sendSuccess(res, 200, "Teams fetched successfully!", teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

export const updateTeamById = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const { id } = req.params;
    const updates = req.body;
    const allowedUpdates = ["teamName", "teamMembers"];

    // If the user isn't found (which should be rare if they're authenticated), return a 404 error.
    if (!loggedInUserId) return sendError(res, 404, "User not found!");

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
    const loggedInUserId = req.user.id;

    // If the user isn't found (which should be rare if they're authenticated), return a 404 error.
    if (!loggedInUserId) return sendError(res, 404, "User not found!");

    const { id } = req.params;
    const deletedTeam = await Team.findByIdAndDelete(id);
    if (!deletedTeam) return sendError(res, 404, "Team not found!");

    // Remove the deleted team's reference from all user's teams arrays
    await User.updateMany(
      { teams: deletedTeam._id },
      { $pull: { teams: deletedTeam._id } }
    );

    // When a team is deleted, ensure the response contains the deleted team in an array.
    sendSuccess(res, 200, "Team deleted successfully!", [deletedTeam]);
  } catch (error) {
    console.error("Error deleting team:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

export const removeUserFromTeam = async (req, res, next) => {
  try {
    const { teamId, userId } = req.params;
    const loggedInUserId = req.user.id;

    // If the user isn't found (which should be rare if they're authenticated), return a 404 error.
    if (!loggedInUserId) return sendError(res, 404, "User not found!");

    if (!isValidObjectId(teamId) || !isValidObjectId(userId)) {
      return sendError(res, 400, "Invalid ID format.");
    }

    const team = await Team.findById(teamId);
    if (!team) return sendError(res, 404, "Team not found!");

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
    const loggedInUserId = req.user.id;

    // If the user isn't found (which should be rare if they're authenticated), return a 404 error.
    if (!loggedInUserId) return sendError(res, 404, "User not found!");

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

// // Controller to get teams by a specific project ID.
// export const getTeamByProjectId = async (req, res, next) => {
//   try {
//     const { projectId } = req.params;

//     // Find project by ID to get its associated teams
//     const project = await Project.findById(projectId).populate("teams");

//     if (!project) {
//       return sendError(res, 404, "Project not found.");
//     }

//     // Check if project has teams
//     if (!project.teams || project.teams.length === 0) {
//       return sendError(res, 404, "No teams associated with this project.");
//     }

//     // Now, fetch team details
//     const teams = await Team.find({ _id: { $in: project.teams } }).populate(
//       "teamMembers"
//     );

//     return sendSuccess(res, 200, "Teams fetched successfully!", teams);
//   } catch (error) {
//     console.error("Error fetching teams by project ID:", error);
//     sendError(res, 500, "Internal Server Error!");
//   }
// };

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

    return sendSuccess(res, 200, "Projects fetched successfully!", [
      team.projects,
    ]);
  } catch (error) {
    console.error("Error fetching projects by team ID:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};
