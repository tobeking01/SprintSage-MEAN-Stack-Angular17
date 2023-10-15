import express from "express";
import {
  createTeam,
  updateTeamById,
  deleteTeamById,
  removeUserFromTeam,
  addUserToTeam,
  getTeamByProjectId,
  getTeamsByUserId,
  getProjectsByTeamId,
} from "../controllers/team.controller.js";
import {
  verifyToken,
  requireRoles,
  ROLES,
} from "../middleware/verify-validate.js";

const router = express.Router();

// Middleware for verifying tokens
// Middleware for verifying tokens
const selfRoles = requireRoles([ROLES.STUDENT, ROLES.PROFESSOR, ROLES.ADMIN]);
const selfRoleAdmin = requireRoles([ROLES.ADMIN]);

// Route to create a new team. Requires self/Admin privileges.
router.post("/createTeam", verifyToken, selfRoles, createTeam);

// Get all teams
router.get("/getTeamsByUserId", verifyToken, getTeamsByUserId);

// Update a team by its ID
router.put("/updateTeamById/:id", verifyToken, updateTeamById);

// Delete a team by its ID. Requires self/Admin privileges.
router.delete(
  "/deleteTeamById/:id",
  verifyToken,
  selfRoleAdmin,
  deleteTeamById
);

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
router.get("/getTeamByProjectId/:projectId", verifyToken, getTeamByProjectId);

// Get projects associated with a specific team
router.get(
  "/getProjectsByTeamId/:teamId/projects",
  verifyToken,
  getProjectsByTeamId
);

// Get teams associated with a specific user
router.get("/getTeamsByUserId/:id", verifyToken, getTeamsByUserId);

export default router;
