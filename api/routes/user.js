// user.router.js
import express from "express";
import { getAllUsers, getUserById } from "../controllers/user.controller.js";
import { verifyToken, verifyAdmin, verifyUser } from "../utils/verifyToken.js";
// Initialize a new instance of the express router.
const router = express.Router();

// Setup the GET route for retrieving all users.
// Before accessing this route, there are two middlewares that run:
// 1. verifyToken - Checks if a valid token is provided in the request.
// 2. verifyAdmin - Ensures that the user is an admin.
router.get("/", verifyToken, verifyAdmin, getAllUsers);

// OR
// router.get("/getAllUsers", verifyToken, verifyAdmin, getAllUsers);

// Setup the GET route for retrieving a user based on its ID.
// Before accessing this route, there are two middlewares that run:
// 1. verifyToken - Checks if a valid token is provided in the request.
// 2. verifyUser - Checks if the logged-in user matches the requested user ID or if the logged-in user is an admin.

router.get("/:id", verifyToken, verifyUser, getUserById);

// OR
router.get("/getUserById/:id", verifyToken, verifyUser, getUserById);

// Export the router for use in other parts of the application.
export default router;
