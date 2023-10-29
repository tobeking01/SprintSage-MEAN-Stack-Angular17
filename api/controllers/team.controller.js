import Team from "../models/Team.js";
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

// Good with new model change!
// The helper function is primarily centered around
// getting a specific team by its ID.
const getTeamByIdHelper = async (teamId) => {
  const team = await Team.findById(teamId).populate({
    path: "teamMembers.user",
    model: "User",
    populate: {
      path: "roles",
      model: "Role",
    },
  });

  return team;
};

export const createTeam = async (req, res, next) => {
  const { teamName, teamMembers } = req.body;

  // Extract the ID of the user who's creating the team
  const creatorUserId = req.user.id;

  // Check if teamName is provided
  if (!teamName) {
    return sendError(res, 400, "Team name is required.");
  }

  // Check if teamName already exists
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

    // Create a new Team instance
    const newTeam = new Team({
      teamName,
    });

    // Add the user who created the team as a team member
    await newTeam.addUser(creatorUserId);

    // Use the addUser method to add each team member
    for (let userId of teamMembers) {
      await newTeam.addUser(userId);
    }

    await newTeam.save();

    sendSuccess(res, 201, "Team Created!", newTeam);
  } catch (error) {
    console.error("Error creating team:", error);
    return sendError(res, 500, "Internal Server Error");
  }
};

// getall teams by user Id... keep
export const getTeamsByUserId = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id.toString(); // endpoint to return teams for the currently authenticated user

    // If the user isn't found (which should be rare if they're authenticated), return a 404 error.
    if (!loggedInUserId) return sendError(res, 404, "User not found!");

    // Adjust the query to look within teamMembers for the user ID
    const teams = await Team.find({
      $or: [
        { createdBy: loggedInUserId },
        { "teamMembers.user": new mongoose.Types.ObjectId(loggedInUserId) },
      ],
    }).populate("teamMembers.user"); // Adjusted to populate user details

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

    // Validate the User ID
    if (!loggedInUserId || !isValidObjectId(loggedInUserId))
      return sendError(res, 404, "Invalid or missing User ID!");

    // Validate the Team ID
    if (!isValidObjectId(id)) return sendError(res, 400, "Invalid Team ID!");

    // Ensure only allowed fields are updated
    const isValidOperation = Object.keys(updates).every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidOperation) return sendError(res, 400, "Invalid updates!");

    // Find and update the team
    const updatedTeam = await Team.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    // If no team is found with the given ID
    if (!updatedTeam) return sendError(res, 404, "Team not found!");

    // Use the helper function to return fully populated team
    const populatedTeam = await getTeamByIdHelper(updatedTeam._id);

    sendSuccess(res, 200, "Team updated successfully!", populatedTeam);
  } catch (error) {
    console.error("Error updating team:", error);
    sendError(res, 500, `Internal Server Error: ${error.message}`);
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
    sendSuccess(res, 200, "Team deleted successfully!", deletedTeam);
  } catch (error) {
    console.error("Error deleting team:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

// Add a user to a team.
export const addUserToTeam = async (req, res, next) => {
  try {
    const { teamId, userId } = req.params;
    const loggedInUserId = req.user.id;

    // Ensure the logged-in user is authenticated.
    if (!loggedInUserId) return sendError(res, 404, "User not found!");

    // Validate ObjectIds for team and user.
    if (!isValidObjectId(teamId) || !isValidObjectId(userId)) {
      return sendError(res, 400, "Invalid ID format.");
    }

    // Use the helper to fetch the team by ID.
    const team = await getTeamByIdHelper(teamId);
    if (!team) return sendError(res, 404, "Team not found!");

    const user = await User.findById(userId);
    if (!user) return sendError(res, 404, "User not found!");

    // Add user to the team using the schema's method.
    await team.addUser(userId);

    sendSuccess(res, 200, "User added to team successfully!", team);
  } catch (error) {
    console.error("Error adding user to team:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

// Remove a user from a team.
export const removeUserFromTeam = async (req, res, next) => {
  try {
    const { teamId, userId } = req.params;
    const loggedInUserId = req.user.id;

    // Ensure the logged-in user is authenticated.
    if (!loggedInUserId) return sendError(res, 404, "User not found!");

    // Validate ObjectIds for team and user.
    if (!isValidObjectId(teamId) || !isValidObjectId(userId)) {
      return sendError(res, 400, "Invalid ID format.");
    }

    // Use the helper to fetch the team by ID.
    const team = await getTeamByIdHelper(teamId);
    if (!team) return sendError(res, 404, "Team not found!");

    const user = await User.findById(userId);
    if (!user) return sendError(res, 404, "User not found!");

    // Check if user is part of the team.
    const index = team.teamMembers
      .map((member) => String(member.user))
      .indexOf(userId);
    if (index > -1) {
      team.teamMembers.splice(index, 1);
      await team.save();
    } else {
      return sendError(res, 400, "User not found in the team.");
    }

    sendSuccess(res, 200, "User removed from team successfully!", team);
  } catch (error) {
    console.error("Error removing user from team:", error);
    sendError(res, 500, error.message);
  }
};

// Fetch projects associated with a specific team ID.
export const getProjectsByTeamId = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    // Validate the teamId
    if (!isValidObjectId(teamId)) {
      return sendError(res, 400, "Invalid ID format.");
    }

    // Use the helper to fetch the team by ID.
    const team = await getTeamByIdHelper(teamId);
    if (!team) {
      return sendError(res, 404, "Team not found.");
    }

    // Check if team has associated projects.
    if (!team.projects || team.projects.length === 0) {
      return sendError(res, 404, "No projects associated with this team.");
    }

    return sendSuccess(
      res,
      200,
      "Projects fetched successfully!",
      team.projects
    );
  } catch (error) {
    console.error("Error fetching projects by team ID:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

export const getTeamsByProjectId = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const loggedInUserId = req.user.id;

    // Validate the provided Project ID
    if (!isValidObjectId(projectId)) {
      return sendError(res, 400, "Invalid Project ID!");
    }

    // Ensure the logged-in user's ID is valid
    if (!isValidObjectId(loggedInUserId)) {
      return sendError(res, 400, "Invalid User ID!");
    }

    // Fetch teams associated with the provided project ID that also have the logged-in user as a team member
    const teams = await Team.find({
      "projects.project": new mongoose.Types.ObjectId(projectId),
      "teamMembers.user": new mongoose.Types.ObjectId(loggedInUserId),
    })
      .populate("teamMembers.user")
      .populate("projects.project");

    // Check if there are no teams associated with the given project ID
    if (!teams.length) {
      return sendSuccess(res, 200, "No teams found for the given project.", []);
    }

    // Return the fetched teams
    sendSuccess(res, 200, "Teams fetched successfully!", teams);
  } catch (error) {
    console.error("Error fetching teams by project:", error);
    sendError(res, 500, `Internal Server Error: ${error.message}`);
  }
};

// Fetch all teams and their associated projects for a specific user.
export const getAllTeamsWithProjectsForUser = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming you have user ID from some authentication middleware

    // Fetch all teams for the user
    const teams = await Team.find({ "teamMembers.user": userId })
      .populate("projects.project")
      .exec();

    if (!teams.length) {
      return sendError(res, 404, "No teams found for the user.");
    }

    return sendSuccess(
      res,
      200,
      "Teams with projects fetched successfully!",
      teams
    );
  } catch (error) {
    console.error("Error fetching teams and projects for user:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};
