import express from "express";
import {
  createTeam,
  updateTeamById,
  getTeamDetailsById,
  deleteTeamById,
  removeUserFromTeam,
  addUserToTeam,
  getTeamsByUserId,
  getProjectsByTeamId,
  getTeamsByProjectId,
  getTeamMembersByProjectId,
  getAllTeamsWithProjectsForUser,
} from "../controllers/team.controller.js";
import { verifyToken } from "../middleware/verify-validate.js";

const router = express.Router();

// Route to create a new team. Requires self/Admin privileges.
router.post("/createTeam", verifyToken, createTeam);

router.get("/getTeamsByProjectId", verifyToken, getTeamsByProjectId);
router.get(
  "/getTeamMembersByProjectId",
  verifyToken,
  getTeamMembersByProjectId
);

// Get all teams
router.get("/getTeamsByUserId", verifyToken, getTeamsByUserId);

// Update a team by its ID
router.put("/updateTeamById/:id", verifyToken, updateTeamById);

router.get("/getTeamDetailsById/:teamId", getTeamDetailsById);

// Delete a team by its ID. Requires self/Admin privileges.
router.delete("/deleteTeamById/:id", verifyToken, deleteTeamById);

// Add a user to a team
router.post("/addUserToTeam/:teamId/:userId", verifyToken, addUserToTeam);

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
  "/getAllTeamsWithProjectsForUser",
  verifyToken,
  getAllTeamsWithProjectsForUser
);

export default router;
