// user.router.js
import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import {
  verifyToken,
  verifyAdmin,
  verifyUser,
} from "../utils/verify-validate.js";
// Initialize a new instance of the express router.
const router = express.Router();

// POST / createUser;
// Route for creating a new user.
// Access: Admin
// Middleware:
// - verifyToken: Validates the JWT token passed in the request header.
// router.post("/createUser", verifyToken, createUser);

router.post("/createUser", createUser);

// Setup the GET route for retrieving all users.
// Before accessing this route, there are two middlewares that run:
// 1. verifyToken - Checks if a valid token is provided in the request.
router.get("/getAllUsers", getAllUsers);

// OR
// router.get("/", verifyToken, getAllUsers);

// Setup the GET route for retrieving a user based on its ID.
// Before accessing this route, there are two middlewares that run:
// 1. verifyToken - Checks if a valid token is provided in the request.

router.get("/getUserById/:id", getUserById);

// OR
// router.get("/:id", verifyToken, getUserById);

// PUT /updateUser/:id
// Route for updating an existing user by ID.
// Access: Admin or the authenticated user.
// Middleware:
// - verifyToken: Validates the JWT token passed in the request header.
// router.put("/updateUser/:id", verifyToken, updateUser);

router.put("/updateUser/:id", updateUser);

// DELETE /deleteUser/:id
// Route for deleting an existing user by ID.
// Access: Admin
// Middleware:
// - verifyToken: Validates the JWT token passed in the request header.
// router.delete("/deleteUser/:id", verifyToken, deleteUser);

router.delete("/deleteUser/:id", deleteUser);

// Export the router for use in other parts of the application.
export default router;
