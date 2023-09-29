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

// Importing any middlewares (if any) like authentication or authorization middlewares.
import { verifyToken, verifyAdmin, verifyUser } from "../utils/verifyToken.js";

// Initialize a new instance of express router.
const router = express.Router();

/**
 * POST /projects
 * Route to create a new project. Linked with the 'createProject' method from Project Controller.
 */
// router.post("/createProject", verifyToken, verifyAdmin, createProject);

router.post("/createProject", createProject); //test API

/**
 * GET /projects
 * Route to get all projects. Linked with the 'getAllProjects' method from Project Controller.
 */
// router.get("/getAllProjects", verifyToken, getAllProjects);

router.get("/getAllProjects", getAllProjects); // test

/**
 * GET /projects/:id
 * Route to get a specific project by its ID. Linked with the 'getProjectById' method from Project Controller.
 */
// router.get("/getProjectById/:id", verifyToken, getProjectById);

router.get("/getProjectById/:id", getProjectById); // test

/**
 * PUT /projects/:id
 * Route to update a specific project by its ID. Linked with the 'updateProjectById' method from Project Controller.
 */
// router.put(
//   "/updateProjectById/:id",
//   verifyToken,
//   verifyAdmin,
//   updateProjectById
// );

router.put("/updateProjectById/:id", updateProjectById); // test

// router.put("/updateProjectById/:id", updateProjectById); // test

/**
 * DELETE /projects/:id
 * Route to delete a specific project by its ID. Linked with the 'deleteProjectById' method from Project Controller.
 */
// router.delete(
//   "/deleteProjectById/:id",
//   verifyToken,
//   verifyAdmin,
//   deleteProjectById
// );

router.delete("/deleteProjectById/:id", deleteProjectById); // test

// router.delete("/deleteProjectById/:id", deleteProjectById); // test

// Exporting the router to be used in the application's main entry file (usually 'app.js' or 'server.js').
export default router;
