import express from "express";
import {
  createTeam,
  updateTeamById,
  deleteTeamById,
  removeUserFromTeam,
  addUserToTeam,
  getTeamsByUserId,
  getProjectsByTeamId,
  getTeamsByProjectId,
  getAllTeamsWithProjectsForUser,
} from "../controllers/team.controller.js";
import { verifyToken } from "../middleware/verify-validate.js";

const router = express.Router();

// Route to create a new team. Requires self/Admin privileges.
router.post("/createTeam", verifyToken, createTeam);

router.get("/getTeamsByProjectId", verifyToken, getTeamsByProjectId);

// Get all teams
router.get("/getTeamsByUserId", verifyToken, getTeamsByUserId);

// Update a team by its ID
router.put("/updateTeamById/:id", verifyToken, updateTeamById);

// Delete a team by its ID. Requires self/Admin privileges.
router.delete("/deleteTeamById/:id", verifyToken, deleteTeamById);

// Add a user to a team
router.post(
  "/addUserToTeam/:teamId/addUser/:userId",
  verifyToken,
  addUserToTeam
);

// Remove a user from a team
router.post(
  "/removeUserFromTeam/:teamId/removeUser/:userId",
  verifyToken,
  removeUserFromTeam
);

// Get teams associated with a specific project
// router.get("/getTeamByProjectId/:projectId", verifyToken, getTeamByProjectId);

// Get projects associated with a specific team
router.get(
  "/getProjectsByTeamId/:teamId/projects",
  verifyToken,
  getProjectsByTeamId
);

// Get teams associated with a specific user
router.get("/getTeamsByUserId/:id", verifyToken, getTeamsByUserId);

router.get(
  "/teamsWithProjectsForUser",
  verifyToken,
  getAllTeamsWithProjectsForUser
);

export default router;
