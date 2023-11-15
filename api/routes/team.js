import express from "express";
import {
  createTeam,
  updateTeamById,
  getTeamDetailsById,
  deleteTeamById,
  removeUserFromTeam,
  addUsersToTeam,
  addUserToTeam,
  getTeamsByUserId,
  getProjectsByTeamId,
  getTeamsByProjectId,
  getTeamMembersByProjectId,
  getAllTeamsWithProjects,
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
router.put("/updateTeamById/:teamId", verifyToken, updateTeamById);

router.get("/getTeamDetailsById/:teamId", verifyToken, getTeamDetailsById);

// Delete a team by its ID. Requires self/Admin privileges.
router.delete("/deleteTeamById/:teamId", verifyToken, deleteTeamById);

// Route to add users to a team
router.post("/:teamId/add-members", verifyToken, addUsersToTeam);

// Add a user to a team
router.post("/addUserToTeam/:teamId/:userId", verifyToken, addUserToTeam);

// Remove a user from a team
router.post(
  "/removeUserFromTeam/:teamId/removeUser/:userId",
  verifyToken,
  removeUserFromTeam
);

// Get projects associated with a specific team
router.get(
  "/getProjectsByTeamId/:teamId/projects",
  verifyToken,
  getProjectsByTeamId
);

// Get teams associated with a specific user
router.get("/getTeamsByUserId/:teamId", verifyToken, getTeamsByUserId);

router.get("/getAllTeamsWithProjects", verifyToken, getAllTeamsWithProjects);

export default router;
