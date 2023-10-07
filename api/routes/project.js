// project.routes.js

// Importing express to use its Router functionality.
import express from "express";

// Importing the Project Controller methods to be linked with routes.
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProjectById,
  deleteProjectById,
} from "../controllers/project.controller.js";

// Initialize a new instance of express router.
const router = express.Router();

/**
 * POST /projects
 * Route to create a new project. Linked with the 'createProject' method from Project Controller.
 */
// router.post("/createProject", verifyToken, createProject);

router.post("/project", createProject);

/**
 * GET /projects
 * Route to get all projects. Linked with the 'getAllProjects' method from Project Controller.
 */
// router.get("/getAllProject", verifyToken, getAllProjects);

router.get("/project", getAllProjects);

/**
 * GET /projects/:id
 * Route to get a specific project by its ID. Linked with the 'getProjectById' method from Project Controller.
 */
// router.get("/getProjectById/:id", verifyToken, getProjectById);

router.get("/project/:id", getProjectById);

/**
 * PUT /projects/:id
 * Route to update a specific project by its ID. Linked with the 'updateProjectById' method from Project Controller.
 */
// router.put(
//   "/updateProjectById/:id",
//   verifyToken,
//   updateProjectById
// );

router.put("/project/:id", updateProjectById);

/**
 * DELETE /projects/:id
 * Route to delete a specific project by its ID. Linked with the 'deleteProjectById' method from Project Controller.
 */
// router.delete(
//   "/deleteProjectById/:id",
//   verifyToken,
//   deleteProjectById
// );

router.delete("/project/:id", deleteProjectById);

// Exporting the router.
export default router;
