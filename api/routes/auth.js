// Importing required modules and functions.
import express from "express";
import {
  registerStudentProfessor,
  login,
  registerAdmin,
  sendEmail,
  resetPassword,
} from "../controllers/auth.controller.js";
import {
  validateStudentProfessor,
  validateLogin,
  validateAdminRegistration,
  verifyToken,
} from "../utils/verify-validate.js";
// Initialize the router from the express module.
const router = express.Router();

// Setup the POST route for user registration.
// The validateRegistration middleware is called first to ensure the request data is valid.
router.post("/register", validateStudentProfessor, registerStudentProfessor);

// Setup the POST route for user login.
// The validateLogin middleware is called first to ensure the request data is valid.
router.post("/login", verifyToken, validateLogin, login);

// validate Admin
router.post("/register-admin", validateAdminRegistration, registerAdmin);

// HTTP POST route for sending an email to reset password.
// When a POST request is made to "/send-email", the sendEmail function is invoked.
router.post("/send-email", sendEmail);

router.post("/reset", resetPassword);

// Export the router for use in other parts of the application.
export default router;
