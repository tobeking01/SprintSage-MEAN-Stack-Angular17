import express from "express";
import {
  createUser,
  updateStudentProfile,
  updateProfessorProfile,
  getLoggedInUserDetails,
  deleteUser,
  getUsersForTeam,
  getRoleMappings,
} from "../controllers/user.controller.js";
import {
  verifyToken,
  requireRoles,
  ROLES,
} from "../middleware/verify-validate.js";

const router = express.Router();

// Middleware for verifying tokens
const selfRoleAdmin = requireRoles([ROLES.ADMIN]);

router.post("/createUser", verifyToken, createUser);

// update student profile
router.put("/updateStudentProfile/:id", verifyToken, updateStudentProfile);

// update professor profile
router.put("/updateProfessorProfile/:id", verifyToken, updateProfessorProfile);

router.get("/getLoggedInUserDetails", verifyToken, getLoggedInUserDetails);

router.delete("/deleteUser/:id", verifyToken, selfRoleAdmin, deleteUser);

router.get("/getUsersForTeam", verifyToken, getUsersForTeam);

router.get("/role-mappings", verifyToken, getRoleMappings);

export default router;
