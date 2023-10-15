// project.routes.js

import express from "express";
import {
  createProject,
  updateProjectById,
  deleteProjectById,
  addMembersToProject,
  getProjectById,
  getProjectsByUserId,
} from "../controllers/project.controller.js";
import { verifyToken } from "../middleware/verify-validate.js";

const router = express.Router();

// Endpoint to create a new project
// Only accessible to authenticated users
router.post("/createProject", verifyToken, createProject);

// Endpoint to update a project by its ID
// Only accessible to authenticated users
router.put("/updateProjectById/:id", verifyToken, updateProjectById);

// Endpoint to delete a project by its ID
// Only accessible to authenticated users
router.delete("/deleteProjectById/:id", verifyToken, deleteProjectById);

// Endpoint to add teams to a project by its ID
// Only accessible to authenticated users
router.put(
  "/addMembersToProject/:id/addTeams",
  verifyToken,
  addMembersToProject
);

router.get("/getProjectById/:id", verifyToken, getProjectById);

// Endpoint to get all projects
// Only accessible to authenticated users
router.get("/getProjectsByUserId", verifyToken, getProjectsByUserId);

// Export the router for use in other parts of the application
export default router;
