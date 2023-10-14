import express from "express";
import {
  getLoggedInUserDetails,
  createUser,
  updateStudentProfile,
  deleteUser,
  getUsersForTeam,
  getRoleMappings,
  updateProfessorProfile,
} from "../controllers/user.controller.js";
import {
  verifyToken,
  requireRoles,
  ROLES,
} from "../middleware/verify-validate.js";

const router = express.Router();

// Middleware for verifying tokens
// Middleware for verifying tokens
const selfRoles = requireRoles([ROLES.STUDENT, ROLES.PROFESSOR, ROLES.ADMIN]);
const selfRoleAdmin = requireRoles([ROLES.ADMIN]);

function noCache(req, res, next) {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
}

router.post("/createUser", verifyToken, selfRoles, createUser);

router.get(
  "/getLoggedInUserDetails",
  verifyToken,
  selfRoles,
  getLoggedInUserDetails
);

// update student profile
router.put(
  "/updateStudentProfile/:id",
  verifyToken,
  selfRoles,
  updateStudentProfile
);

// update professor profile
router.put(
  "/updateProfessorProfile/:id",
  verifyToken,
  selfRoles,
  updateProfessorProfile
);

router.get("/getUsersForTeam", verifyToken, selfRoles, getUsersForTeam);

router.delete("/deleteUser/:id", verifyToken, selfRoleAdmin, deleteUser);

router.get("/role-mappings", verifyToken, selfRoles, getRoleMappings);

export default router;
