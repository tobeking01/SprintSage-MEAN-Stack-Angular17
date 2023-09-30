// Importing required modules and functions.
import express from "express";
import {
  registerStudentProfessor,
  login,
  registerAdmin,
  sendEmail,
  resetPassword,
} from "../controllers/auth.controller.js";

// Initialize the router from the express module.
const router = express.Router();

// Middleware function for validating the data provided for user registration.
// This function checks that all required fields are provided.
const allowedRoles = ["Student", "Professor"];

const validateStudentProfessor = (req, res, next) => {
  const { email, password, firstName, lastName, userName, role } = req.body;

  // Check if all the required fields are present in the request body.
  if (!email || !password || !firstName || !lastName || !userName || !role) {
    return res.status(400).send("Missing required fields for registration.");
  }

  // Check if the role assigned is one of the allowed roles.
  if (!allowedRoles.includes(role)) {
    return res
      .status(400)
      .send("Invalid or not allowed role for registration.");
  }

  // If all validations pass, call the next middleware or handler.
  next();
};

// Middleware function for validating the data provided for user login.
// This function checks that email and password are provided.
const validateLogin = (req, res, next) => {
  // Checks if both email and password are present in the request body.
  if (!req.body.userName || !req.body.password) {
    // If either email or password is missing, respond with an error message.
    return res.status(400).send("User name and password are required.");
  }
  // If both fields are present, call the next middleware or handler.
  next();
};

const validateAdminRegistration = (req, res, next) => {
  const { email, password, firstName, lastName, userName, role } = req.body;
  if (!email || !password || !firstName || !lastName || !userName || !role) {
    return res.status(400).send("Missing required fields for registration.");
  }
  if (role !== "Admin") {
    return res
      .status(400)
      .send("Invalid or not allowed role for registration.");
  }
  next();
};

// Setup the POST route for user registration.
// The validateRegistration middleware is called first to ensure the request data is valid.
router.post("/register", validateStudentProfessor, registerStudentProfessor);

// Setup the POST route for user login.
// The validateLogin middleware is called first to ensure the request data is valid.
router.post("/login", validateLogin, login);

// validate Admin
router.post("/register-admin", validateAdminRegistration, registerAdmin);

// HTTP POST route for sending an email to reset password.
// When a POST request is made to "/send-email", the sendEmail function is invoked.
router.post("/send-email", sendEmail);

router.post("/reset", resetPassword);
// Middleware for generic error handling.
// This captures any errors that might have been thrown in previous middleware or route handlers.
router.use((err, req, res, next) => {
  // Log the error stack trace to the console.
  console.error(err.stack);
  // Respond with a generic error message.
  res.status(500).send("Something broke!");
});

// Utilities
// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Export the router for use in other parts of the application.
export default router;
