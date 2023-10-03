import Jwt from "jsonwebtoken";
import { CreateError } from "./error.js";

// Constants
const STATUS_CODE = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 403,
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

const allowedRoles = ["Student", "Professor"];

// Verification Middlewares
export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token)
    return next(CreateError(STATUS_CODE.UNAUTHORIZED, "No token provided!"));

  Jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return next(CreateError(STATUS_CODE.UNAUTHORIZED, "Token is not valid"));
    req.userId = decoded.id;
    next();
  });
};

export const verifyUser = (req, res, next) => {
  const { user, params: { id } = {} } = req;
  if (!user || !id)
    return next(
      CreateError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        "Missing user object or parameters"
      )
    );

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

export const verifyAdmin = (req, res, next) => {
  if (!req.user)
    return next(
      CreateError(STATUS_CODE.INTERNAL_SERVER_ERROR, UNEXPECTED_ERROR)
    );
  req.user.isAdmin
    ? next()
    : next(CreateError(STATUS_CODE.UNAUTHORIZED, UNAUTHORIZED_ADMIN));
};

export const verifyProfessor = (req, res, next) => {
  if (!req.user)
    return next(
      CreateError(STATUS_CODE.INTERNAL_SERVER_ERROR, UNEXPECTED_ERROR)
    );
  req.user.isProfessor || req.user.isAdmin
    ? next()
    : next(CreateError(STATUS_CODE.UNAUTHORIZED, UNAUTHORIZED_PROFESSOR));
};

// Validation Middlewares
export const validateStudentProfessor = (req, res, next) => {
  const { email, password, firstName, lastName, userName, role } = req.body;
  return !email || !password || !firstName || !lastName || !userName || !role
    ? res.status(STATUS_CODE.BAD_REQUEST).send(ERRORS.MISSING_FIELDS)
    : !allowedRoles.includes(role)
    ? res.status(STATUS_CODE.BAD_REQUEST).send(ERRORS.INVALID_ROLE)
    : next();
};

export const validateLogin = (req, res, next) => {
  !req.body.userName || !req.body.password
    ? res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: USER_NAME_PASSWORD_REQUIRED })
    : next();
};

export const validateAdminRegistration = (req, res, next) => {
  const { email, password, firstName, lastName, userName, role } = req.body;
  if (!email || !password || !firstName || !lastName || !userName || !role)
    return res.status(STATUS_CODE.BAD_REQUEST).send(MISSING_FIELDS_ERROR);
  role !== "Admin"
    ? res.status(STATUS_CODE.BAD_REQUEST).send(INVALID_ROLE_ERROR)
    : next();
};
