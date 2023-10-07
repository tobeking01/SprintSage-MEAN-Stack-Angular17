import express from "express";
import {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeamById,
  deleteTeamById,
  removeUserFromTeam,
  addUserToTeam,
  getTeamByProjectId,
} from "../controllers/team.controller.js";

const router = express.Router();

/**
 * POST /teams
 * Route to create a new team. Requires admin privileges.
 * It uses 'createTeam' method from Team Controller.
 */
// router.post("/createTeam", verifyToken, createTeam);

router.post("/createTeam", createTeam); // test

/**
 * GET /teams
 * Route to get all teams. It uses 'getAllTeams' method from Team Controller.
 */
// router.get("/getAllTeams", verifyToken, getAllTeams);

router.get("/getAllTeams", getAllTeams); // test

/**
 * GET /teams/:id
 * Route to get a specific team by its ID.
 * It uses 'getTeamById' method from Team Controller.
 */
// Get team by its ID
router.get("/getTeamById/:id", getTeamById);

// Update team by its ID
router.put("/updateTeamById/:id", updateTeamById);

// Remove a user from a team
router.post("/team/:teamId/removeUser/:userId", removeUserFromTeam);

// Add a user to a team
router.post("/team/:teamId/addUser/:userId", addUserToTeam);

// Get teams associated with a specific project
router.get("/teamsByProject/:projectId", getTeamByProjectId);

/**
 * DELETE /teams/:id
 * Route to delete a specific team by its ID. Requires admin privileges.
 * It uses 'deleteTeamById' method from Team Controller.
 */
router.delete("/deleteTeamById/:id", deleteTeamById);

// Export the configured routes to be used in the application.
export default router;
