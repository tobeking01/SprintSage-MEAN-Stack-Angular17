import Jwt from "jsonwebtoken";
import { CreateError } from "./error.js";

// Constants that define the HTTP status codes for easier referencing.
const STATUS_CODE = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 403,
  INTERNAL_SERVER_ERROR: 500,
};

// Constants that contain pre-defined error messages.
const ERRORS = {
  MISSING_FIELDS: "Missing required fields for registration.",
  INVALID_ROLE: "Invalid or not allowed role for registration.",
  USER_NAME_PASSWORD_REQUIRED: "User name and password are required.",
  UNEXPECTED_ERROR: "Unexpected error: Missing user object",
  UNAUTHORIZED_ADMIN: "Unauthorized: You are not an authorized Admin!",
  UNAUTHORIZED_PROFESSOR: "Unauthorized: You are not an authorized Professor!",
};

// An array defining the roles that are allowed to register.
const allowedRoles = ["Student", "Professor"];

/**
 * Middleware to verify the JWT token present in the request.
 * If the token is absent or invalid, it responds with an appropriate error.
 */
export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token; // Retrieve token from cookies
  if (!token)
    // Check if token is present
    return next(CreateError(STATUS_CODE.UNAUTHORIZED, "No token provided!"));

  // Verify the token using the JWT_SECRET
  Jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return next(CreateError(STATUS_CODE.UNAUTHORIZED, "Token is not valid"));
    req.userId = decoded.id; // Assign the decoded user ID to the request object
    next();
  });
};

/**
 * Middleware to verify if the user has appropriate access rights based on their ID or role.
 * It checks if the user's ID matches the resource's ID or if the user has admin/moderator roles.
 */
export const verifyUser = (req, res, next) => {
  const { user, params: { id } = {} } = req;
  if (!user || !id)
    return next(
      CreateError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        "Missing user object or parameters"
      )
    );

  // Check if user is authorized based on ID or role
  const isUserAllowed =
    user.id === id.toString() ||
    user.roles.some((role) =>
      ["moderator", "admin"].includes(role.toLowerCase())
    );
  return isUserAllowed
    ? next()
    : next(
        CreateError(
          STATUS_CODE.UNAUTHORIZED,
          "Unauthorized: You do not have access to this resource!"
        )
      );
};

/**
 * Middleware to verify if the logged-in user has administrative privileges.
 * It does so by checking the 'isAdmin' property of the user object.
 */
export const verifyAdmin = (req, res, next) => {
  if (!req.user)
    return next(
      CreateError(STATUS_CODE.INTERNAL_SERVER_ERROR, ERRORS.UNEXPECTED_ERROR)
    );
  req.user.isAdmin
    ? next()
    : next(CreateError(STATUS_CODE.UNAUTHORIZED, ERRORS.UNAUTHORIZED_ADMIN));
};

/**
 * Middleware to check if the user has the privileges of a professor or an administrator.
 * It does so by checking the 'isProfessor' and 'isAdmin' properties of the user object.
 */
export const verifyProfessor = (req, res, next) => {
  if (!req.user)
    return next(
      CreateError(STATUS_CODE.INTERNAL_SERVER_ERROR, ERRORS.UNEXPECTED_ERROR)
    );
  req.user.isProfessor || req.user.isAdmin
    ? next()
    : next(
        CreateError(STATUS_CODE.UNAUTHORIZED, ERRORS.UNAUTHORIZED_PROFESSOR)
      );
};

/**
 * Middleware to validate the registration data of students or professors.
 * It ensures that all required fields are present and that the provided role is either "Student" or "Professor".
 */
export const validateStudentProfessor = (req, res, next) => {
  const { email, password, firstName, lastName, userName, role } = req.body;

  // Check for the presence of all required fields
  return !email || !password || !firstName || !lastName || !userName || !role
    ? res.status(STATUS_CODE.BAD_REQUEST).send(ERRORS.MISSING_FIELDS)
    : // Check if the provided role is valid
    !allowedRoles.includes(role)
    ? res.status(STATUS_CODE.BAD_REQUEST).send(ERRORS.INVALID_ROLE)
    : // If all checks pass, move to the next middleware
      next();
};

/**
 * Middleware to validate login data.
 * It checks if both the 'userName' and 'password' fields are provided in the request.
 */
export const validateLogin = (req, res, next) => {
  !req.body.userName || !req.body.password
    ? res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: ERRORS.USER_NAME_PASSWORD_REQUIRED })
    : next();
};

/**
 * Middleware to validate the registration data of administrators.
 * It checks for the presence of all required fields and verifies that the role provided is "Admin".
 */
export const validateAdminRegistration = (req, res, next) => {
  const { email, password, firstName, lastName, userName, role } = req.body;
  if (!email || !password || !firstName || !lastName || !userName || !role)
    return res.status(STATUS_CODE.BAD_REQUEST).send(ERRORS.MISSING_FIELDS);
  role !== "Admin"
    ? res.status(STATUS_CODE.BAD_REQUEST).send(ERRORS.INVALID_ROLE)
    : next();
};
