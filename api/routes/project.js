// project.routes.js

import express from "express";
import {
  createProject,
  getProjectsByUserId,
  getProjectById,
  updateProjectById,
  deleteProjectById,
  addMembersToProject,
} from "../controllers/project.controller.js";
import {
  verifyToken,
  requireRoles,
  ROLES,
} from "../middleware/verify-validate.js";

const router = express.Router();

// Middleware for verifying tokens
const selfRoles = requireRoles([ROLES.STUDENT, ROLES.PROFESSOR, ROLES.ADMIN]);
const selfRoleAdmin = requireRoles([ROLES.ADMIN]);

// Endpoint to create a new project
// Only accessible to authenticated users
router.post("/createProject", verifyToken, selfRoles, createProject);

// Endpoint to get all projects
// Only accessible to authenticated users
router.get("/getProjectsByUserId", verifyToken, selfRoles, getProjectsByUserId);

// Endpoint to get a project by its ID
// Only accessible to authenticated users
router.get("/getProjectById/:id", verifyToken, selfRoles, getProjectById);

// Endpoint to update a project by its ID
// Only accessible to authenticated users
router.put("/updateProjectById/:id", verifyToken, selfRoles, updateProjectById);

// Endpoint to delete a project by its ID
// Only accessible to authenticated users
router.delete(
  "/deleteProjectById/:id",
  verifyToken,
  selfRoles,
  deleteProjectById
);

// Endpoint to add teams to a project by its ID
// Only accessible to authenticated users
router.put("/:id/addTeams", verifyToken, selfRoles, addMembersToProject);

// Export the router for use in other parts of the application
export default router;
