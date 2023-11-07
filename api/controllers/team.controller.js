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

    // Create a new Team instance with createdBy
    const newTeam = new Team({
      teamName,
      createdBy: creatorUserId,
    });

    // Add the creator as the first team member
    newTeam.teamMembers.push({ user: creatorUserId });

    // Add each additional team member
    teamMembers.forEach((userId) => {
      if (userId.toString() !== creatorUserId.toString()) {
        newTeam.teamMembers.push({ user: userId });
      }
    });

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
    const loggedInUserId = req.user.id.toString();

    if (!loggedInUserId) return sendError(res, 404, "User not found!");

    const teams = await Team.find({
      $or: [
        { createdBy: loggedInUserId },
        { "teamMembers.user": new mongoose.Types.ObjectId(loggedInUserId) },
      ],
    })
      .populate({
        path: "createdBy",
        select: "firstName lastName", // Selects only the firstName and lastName fields, excludes the _id field
      })
      .populate("teamMembers.user"); // Adjusted to populate user details

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

export const getTeamDetailsById = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    // Validate the Team ID
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return sendError(res, 400, "Invalid Team ID");
    }

    // Fetch the team details and populate necessary fields
    const teamDetails = await Team.findById(teamId)
      .populate({
        path: "teamMembers.user",
        select: "firstName lastName", // Adjust the fields according to your needs
      })
      .populate({
        path: "createdBy",
        select: "firstName lastName", // Adjust the fields according to your needs
      })
      .populate({
        path: "projects.project",
        select: "projectName", // Adjust the fields according to your needs
      });

    // If no team is found with the given ID
    if (!teamDetails) {
      return sendError(res, 404, "Team not found!");
    }

    // Return the team details with a success message
    return sendSuccess(
      res,
      200,
      "Team details fetched successfully",
      teamDetails
    );
  } catch (error) {
    console.error("Error fetching team details:", error);
    return sendError(res, 500, `Internal Server Error: ${error.message}`);
  }
};

export const updateTeamById = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const { id } = req.params;
    const { teamName, teamMembers } = req.body;
    // Validate the Team ID
    if (!mongoose.isValidObjectId(id))
      return res.status(400).send("Invalid Team ID!");

    // Find the team
    const team = await Team.findById(id);
    if (!team) return res.status(404).send("Team not found!");

    // Check if the logged-in user is authorized to make changes
    if (team.createdBy.toString() !== loggedInUserId) {
      return res.status(403).send("Unauthorized to modify this team.");
    }

    // Update team name if provided
    if (teamName) team.teamName = teamName;

    // Remove all existing members
    team.teamMembers = [];

    // Add the new set of members
    if (teamMembers && Array.isArray(teamMembers)) {
      for (const member of teamMembers) {
        // Check if 'member' is an object and has an '_id' property
        const memberId = member._id || member;
        // Ensure memberId is a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(memberId)) {
          team.teamMembers.push({
            user: new mongoose.Types.ObjectId(memberId),
          });
        } else {
          return res.status(400).send(`Invalid User ID: ${memberId}`);
        }
      }
    }

    // Save the changes
    await team.save();

    // Respond with success
    return res.status(200).json({
      message: "Team updated successfully!",
      team,
    });
  } catch (error) {
    console.error("Error updating team:", error);
    return res.status(500).send(`Internal Server Error: ${error.message}`);
  }
};

export const deleteTeamById = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;

    if (!loggedInUserId) {
      return sendError(res, 401, "Unauthorized: User authentication failed.");
    }

    const { id } = req.params;

    // Find the team to check if the logged-in user is the owner
    const team = await Team.findById(id);
    if (!team) {
      return sendError(res, 404, "Team not found!");
    }

    if (team.createdBy.toString() !== loggedInUserId.toString()) {
      return sendError(
        res,
        403,
        "Forbidden: You do not have permission to delete this team."
      );
    }

    // Use deleteOne method to delete the team
    await Team.deleteOne({ _id: id });

    // Since the document is not returned by deleteOne, send a custom message
    sendSuccess(res, 200, "Team deleted successfully!", { _id: id });
  } catch (error) {
    console.error("Error deleting team:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};

// Add a user to a team.
export const addUserToTeam = async (req, res, next) => {
  try {
    const { teamId, userId } = req.params;
    console.log(`Team ID: ${teamId}, User ID: ${userId}`);

    const loggedInUserId = req.user.id;

    if (!loggedInUserId) {
      return sendError(res, 404, "User not found!");
    }

    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

    if (!isValidObjectId(teamId) || !isValidObjectId(userId)) {
      return sendError(res, 400, "Invalid ID format.");
    }

    const team = await mongoose.model("Team").findById(teamId);
    if (!team) {
      return sendError(res, 404, "Team not found!");
    }

    // Check if logged-in user is authorized to add members to the team
    // This part depends on your application's logic
    if (team.createdBy.toString() !== loggedInUserId.toString()) {
      return sendError(res, 403, "Not authorized to add members to this team.");
    }

    const user = await mongoose.model("User").findById(userId);
    if (!user) {
      return sendError(res, 404, "User not found!");
    }

    if (team.teamMembers.some((member) => member.user.toString() === userId)) {
      return sendError(res, 400, "User already in team.");
    }

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

    if (!loggedInUserId) {
      return sendError(res, 404, "User not found!");
    }

    if (!isValidObjectId(teamId) || !isValidObjectId(userId)) {
      return sendError(res, 400, "Invalid ID format.");
    }

    const team = await mongoose.model("Team").findById(teamId);
    if (!team) {
      return sendError(res, 404, "Team not found!");
    }

    if (!team.createdBy.equals(loggedInUserId)) {
      return sendError(res, 403, "Unauthorized to remove user from team.");
    }

    const user = await mongoose.model("User").findById(userId);
    if (!user) {
      return sendError(res, 404, "User not found with ID: " + userId);
    }

    const userInTeam = team.teamMembers.some(
      (member) => member.user.toString() === userId
    );

    if (!userInTeam) {
      return sendError(
        res,
        400,
        "User with ID: " + userId + " not found in team."
      );
    }

    team.teamMembers = team.teamMembers.filter(
      (member) => member.user.toString() !== userId
    );

    await team.save();
    sendSuccess(res, 200, "User removed from team successfully!", team);
  } catch (error) {
    console.error("Error removing user from team: ", error);
    sendError(res, 500, "Internal Server Error: " + error.message);
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

// Fetch all teams by projectId [used in project-details]
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

// Fetch all team members by projectId [used in create-ticket]
export const getTeamMembersByProjectId = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const loggedInUserId = req.user.id;

    // Validate the provided Project ID
    if (!isValidObjectId(projectId)) {
      return sendError(res, 400, "Invalid Project ID!");
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

    // Flatten the array of team member arrays
    const teamMembersFlattened = teams.reduce(
      (acc, team) => acc.concat(team.teamMembers),
      []
    );

    // Return the fetched team members
    sendSuccess(
      res,
      200,
      "Team members fetched successfully!",
      teamMembersFlattened
    );
  } catch (error) {
    console.error("Error fetching teams by project:", error);
    sendError(res, 500, `Internal Server Error: ${error.message}`);
  }
};

// Fetch all teams and their associated projects.
export const getAllTeamsWithProjects = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming you have user ID from some authentication middleware

    // Fetch all teams
    let teams = await Team.find({}).populate("projects.project").exec();

    if (!teams.length) {
      return sendError(res, 404, "No teams found.");
    }

    // Filter teams to include only those where the logged-in user is a member
    teams = teams.filter((team) =>
      team.teamMembers.some((member) => member.user.toString() === userId)
    );

    // If after filtering there are no teams, it means the user isn't part of any team.
    if (!teams.length) {
      return sendError(res, 404, "User is not part of any teams.");
    }

    return sendSuccess(
      res,
      200,
      "Teams with projects fetched successfully!",
      teams
    );
  } catch (error) {
    console.error("Error fetching teams and projects:", error);
    sendError(res, 500, "Internal Server Error!");
  }
};
