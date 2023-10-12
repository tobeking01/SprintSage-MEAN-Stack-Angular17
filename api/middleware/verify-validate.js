import Jwt from "jsonwebtoken";
import { sendError } from "../utils/createResponse.js";

const STATUS_CODE = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  INTERNAL_SERVER_ERROR: 500,
};

const ERRORS = {
  MISSING_FIELDS: "Missing required fields for registration.",
  INVALID_ROLE: "Invalid or not allowed role for registration.",
  USER_NAME_PASSWORD_REQUIRED: "User name and password are required.",
  UNEXPECTED_ERROR: "Unexpected error: Missing user object",
  UNAUTHORIZED_ADMIN: "Unauthorized: You are not an authorized Admin!",
  UNAUTHORIZED_PROFESSOR: "Unauthorized: You are not an authorized Professor!",
};

export const ROLES = {
  STUDENT: "Student",
  PROFESSOR: "Professor",
  ADMIN: "Admin",
};

const allowedRoles = [ROLES.STUDENT, ROLES.PROFESSOR];

export const verifyToken = (req, res, next) => {
  let token = req.cookies.access_token;

  if (!token && req.headers.authorization) {
    const [bearer, jwtToken] = req.headers.authorization.split(" ");
    if (bearer === "Bearer" && jwtToken) {
      token = jwtToken;
    }
  }

  if (!token) {
    return sendError(res, STATUS_CODE.UNAUTHORIZED, "No token provided!");
  }

  Jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return sendError(res, STATUS_CODE.UNAUTHORIZED, "Token has expired");
      }
      return sendError(res, STATUS_CODE.UNAUTHORIZED, "Token is not valid");
    }

    req.user = decoded; // IMPORTANT do not change
    next();
  });
};

// role-check.middleware.js
export const requireRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.error("No user object in request.");
      return sendError(res, 403, "User object missing in request.");
    }

    if (!req.user.roles || !req.user.roles.length) {
      console.error("User object doesn't have a role.");
      return sendError(res, 403, "User role missing in request.");
    }

    if (req.user.roles.some((role) => roles.includes(role))) {
      next();
    } else {
      console.error(`User's role ${req.user.roles.join(", ")} not authorized.`);
      sendError(
        res,
        403,
        "You do not have the required permissions to perform this operation."
      );
    }
  };
};

// SelfOrRole-check.middleware.js
export const requireSelfRole = (role) => {
  return (req, res, next) => {
    if (
      req.user &&
      (req.user.role === role || req.user._id.equals(req.params.id))
    ) {
      next();
    } else {
      sendError(
        res,
        403,
        "You do not have the required permissions to perform this operation."
      );
    }
  };
};

export const validateStudentProfessor = (req, res, next) => {
  const { email, password, firstName, lastName, userName, role } = req.body;

  if (!email || !password || !firstName || !lastName || !userName || !role) {
    return sendError(res, STATUS_CODE.BAD_REQUEST, ERRORS.MISSING_FIELDS);
  }

  if (!allowedRoles.includes(role)) {
    return sendError(res, STATUS_CODE.BAD_REQUEST, ERRORS.INVALID_ROLE);
  }

  next();
};

export const validateLogin = (req, res, next) => {
  if (!req.body.userName || !req.body.password) {
    return sendError(
      res,
      STATUS_CODE.BAD_REQUEST,
      ERRORS.USER_NAME_PASSWORD_REQUIRED
    );
  }

  next();
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return sendError(
      res,
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      ERRORS.UNEXPECTED_ERROR
    );
  }
  req.user.role === ROLES.ADMIN
    ? next()
    : sendError(res, STATUS_CODE.UNAUTHORIZED, ERRORS.UNAUTHORIZED_ADMIN);
};
