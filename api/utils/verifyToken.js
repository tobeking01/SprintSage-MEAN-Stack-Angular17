import Jwt from "jsonwebtoken"; // Importing the JSON Web Token library for token validation.
import { CreateError } from "./error.js"; // Import the custom error utility to create standard error messages.

// Function to check token expiry and return appropriate error
const checkTokenExpiry = (err) => {
  if (err.name === "TokenExpiredError") {
    return CreateError(401, "Token has expired");
  }
  return CreateError(403, "Token is not valid");
};

/**
 * Middleware to verify if the JWT token exists and is valid.
 */
export const verifyToken = (req, res, next) => {
  // Extract the 'access_token' from the request cookies.
  const token = req.cookies.access_token;

  // If the token is missing, return an authentication error.
  if (!token) return next(CreateError(401, "You are not authenticated!"));

  // Verify the JWT token's validity using the app's secret key.
  Jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (err) return next(checkTokenExpiry(err)); // Use checkTokenExpiry for error checking.

    // If the token is verified successfully, add the decoded user to the request object.
    req.user = decodedUser;

    // Move to the next middleware or request handler.
    next();
  });
};

/**
 * Middleware to verify if the request user is the same as the one in the token
 * or if the user is an admin.
 */
export const verifyUser = (req, res, next) => {
  // Check if the user ID in the token matches the user ID in request parameters,
  // or if the user has an admin role.
  if (req.user.id === req.params.id.toString() || req.user.isAdmin) {
    // Move to the next middleware or request handler.
    next();
  } else {
    // If not, return an authorization error.
    return next(CreateError(403, "You are not an authorized User!"));
  }
};

/**
 * Middleware to verify if the user has admin rights.
 */
export const verifyAdmin = (req, res, next) => {
  // Check if the user exists in the request (set by verifyToken middleware).
  if (!req.user) {
    return next(CreateError(401, "Token is missing or invalid"));
  }

  // Check if the user has an admin role.
  if (req.user.isAdmin) {
    // Move to the next middleware or request handler.
    next();
  } else {
    // If not, return an authorization error.
    return next(CreateError(403, "You are not an authorized Admin!"));
  }
};
