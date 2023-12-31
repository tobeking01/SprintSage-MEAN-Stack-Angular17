import express from "express";
import {
  createUser,
  updateStudentProfile,
  updateProfessorProfile,
  getUserProfile,
  deleteUser,
  getUsersForTeam,
  getUserId,
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

router.get("/getUserProfile", verifyToken, getUserProfile);

router.delete("/deleteUser/:id", verifyToken, selfRoleAdmin, deleteUser);

router.get("/getUsersForTeam", verifyToken, getUsersForTeam);

router.get("/user/profile", verifyToken, getUserId);

export default router;
