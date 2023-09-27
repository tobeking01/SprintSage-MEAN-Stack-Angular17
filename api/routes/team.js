import express from "express";
import {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeamById,
  deleteTeamById,
} from "../controllers/team.controller.js";

import { verifyToken, verifyAdmin, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

/**
 * POST /teams
 * Route to create a new team. Requires admin privileges.
 * It uses 'createTeam' method from Team Controller.
 */
// router.post("/createTeam", verifyToken, verifyAdmin, createTeam);

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
router.get("/getTeamById/:id", verifyToken, getTeamById);

/**
 * PUT /teams/:id
 * Route to update a specific team by its ID. Requires admin privileges.
 * It uses 'updateTeamById' method from Team Controller.
 */
router.put("/updateTeamById/:id", verifyToken, verifyAdmin, updateTeamById);

/**
 * DELETE /teams/:id
 * Route to delete a specific team by its ID. Requires admin privileges.
 * It uses 'deleteTeamById' method from Team Controller.
 */
router.delete("/deleteTeamById/:id", verifyToken, verifyAdmin, deleteTeamById);

// Export the configured routes to be used in the application.
export default router;
