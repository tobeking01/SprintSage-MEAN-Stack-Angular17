// user.router.js
import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { verifyToken, verifyAdmin, verifyUser } from "../utils/verifyToken.js";
// Initialize a new instance of the express router.
const router = express.Router();

// POST / createUser;
// Route for creating a new user.
// Access: Admin
// Middleware:
// - verifyToken: Validates the JWT token passed in the request header.
// - verifyAdmin: Ensures the authenticated user has admin privileges.
// router.post("/createUser", verifyToken, verifyAdmin, createUser);

router.post("/createUser", createUser);

// Setup the GET route for retrieving all users.
// Before accessing this route, there are two middlewares that run:
// 1. verifyToken - Checks if a valid token is provided in the request.
// 2. verifyAdmin - Ensures that the user is an admin.
router.get("/getAllUsers", verifyToken, verifyAdmin, getAllUsers);

// OR
// router.get("/", verifyToken, verifyAdmin, getAllUsers);

// Setup the GET route for retrieving a user based on its ID.
// Before accessing this route, there are two middlewares that run:
// 1. verifyToken - Checks if a valid token is provided in the request.
// 2. verifyUser - Checks if the logged-in user matches the requested user ID or if the logged-in user is an admin.

router.get("/getUserById/:id", verifyToken, verifyUser, getUserById);

// OR
// router.get("/:id", verifyToken, verifyUser, getUserById);

// PUT /updateUser/:id
// Route for updating an existing user by ID.
// Access: Admin or the authenticated user.
// Middleware:
// - verifyToken: Validates the JWT token passed in the request header.
// - verifyUser: Ensures the authenticated user is modifying their own data or is an admin.
router.put("/updateUser/:id", verifyToken, verifyUser, updateUser);

// DELETE /deleteUser/:id
// Route for deleting an existing user by ID.
// Access: Admin
// Middleware:
// - verifyToken: Validates the JWT token passed in the request header.
// - verifyAdmin: Ensures the authenticated user has admin privileges.
router.delete("/deleteUser/:id", verifyToken, verifyAdmin, deleteUser);

// Export the router for use in other parts of the application.
export default router;
