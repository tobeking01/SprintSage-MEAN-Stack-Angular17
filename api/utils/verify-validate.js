import Jwt from "jsonwebtoken";
import { sendError } from "./createResponse.js";

// Constants defining the HTTP status codes for easier referencing.
const STATUS_CODE = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  INTERNAL_SERVER_ERROR: 500,
};

// Constants containing pre-defined error messages.
const ERRORS = {
  MISSING_FIELDS: "Missing required fields for registration.",
  INVALID_ROLE: "Invalid or not allowed role for registration.",
  USER_NAME_PASSWORD_REQUIRED: "User name and password are required.",
  UNEXPECTED_ERROR: "Unexpected error: Missing user object",
  UNAUTHORIZED_ADMIN: "Unauthorized: You are not an authorized Admin!",
  UNAUTHORIZED_PROFESSOR: "Unauthorized: You are not an authorized Professor!",
};

const allowedRoles = ["Student", "Professor"];

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return sendError(res, STATUS_CODE.UNAUTHORIZED, "No token provided!");
  }

  Jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return sendError(res, STATUS_CODE.UNAUTHORIZED, "Token is not valid");
    }
    req.userId = decoded.id;
    next();
  });
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
  req.user.isAdmin
    ? next()
    : sendError(res, STATUS_CODE.UNAUTHORIZED, ERRORS.UNAUTHORIZED_ADMIN);
};
