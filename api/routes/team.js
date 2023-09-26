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
router.post("/", verifyToken, verifyAdmin, createTeam);

/**
 * GET /teams
 * Route to get all teams. It uses 'getAllTeams' method from Team Controller.
 */
router.get("/", verifyToken, getAllTeams);

/**
 * GET /teams/:id
 * Route to get a specific team by its ID.
 * It uses 'getTeamById' method from Team Controller.
 */
router.get("/:id", verifyToken, getTeamById);

/**
 * PUT /teams/:id
 * Route to update a specific team by its ID. Requires admin privileges.
 * It uses 'updateTeamById' method from Team Controller.
 */
router.put("/:id", verifyToken, verifyAdmin, updateTeamById);

/**
 * DELETE /teams/:id
 * Route to delete a specific team by its ID. Requires admin privileges.
 * It uses 'deleteTeamById' method from Team Controller.
 */
router.delete("/:id", verifyToken, verifyAdmin, deleteTeamById);

// Export the configured routes to be used in the application.
export default router;
