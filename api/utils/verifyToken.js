import Jwt from "jsonwebtoken"; // Importing the JSON Web Token library for token validation.
import { CreateError } from "./error.js"; // Import the custom error utility to create standard error messages.

const checkTokenExpiry = (err) => {
  if (err.name === "TokenExpiredError") {
    return CreateError(401, "Token has expired");
  }
  return CreateError(403, "Token is not valid");
};

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) return next(CreateError(403, "No token provided!"));

    Jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(checkTokenExpiry(err));
      req.userId = decoded.id;
      next();
    });
  } catch (error) {
    console.error("Error during token verification:", error);
    return next(CreateError(500, "Internal Server Error."));
  }
};

export const verifyUser = (req, res, next) => {
  if (!req.user)
    return next(CreateError(500, "Unexpected error: Missing user object"));

  if (
    req.user.id === req.params.id.toString() ||
    req.user.isModerator ||
    req.user.isAdmin
  ) {
    next();
  } else {
    return next(
      CreateError(403, "Unauthorized: You do not have access to this resource!")
    );
  }
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user)
    return next(CreateError(500, "Unexpected error: Missing user object"));

  if (req.user.isAdmin) {
    next();
  } else {
    return next(
      CreateError(403, "Unauthorized: You are not an authorized Admin!")
    );
  }
};

// Middleware to verify if the user has moderator rights.
export const verifyModerator = (req, res, next) => {
  if (!req.user)
    return next(CreateError(500, "Unexpected error: Missing user object"));

  if (req.user.isModerator || req.user.isAdmin) {
    next();
  } else {
    return next(
      CreateError(403, "Unauthorized: You are not an authorized Moderator!")
    );
  }
};
