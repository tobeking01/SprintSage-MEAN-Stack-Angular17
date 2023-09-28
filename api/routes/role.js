// role.router.js
import express from "express";
import {
  initializeRoles,
  getAllRoles,
  updateRole,
  deleteRole,
} from "../controllers/role.controller.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// Route to initialize  a new role. Accessible only by Admins after token verification.
// router.post("/createRole", verifyAdmin, createRole); // Simplified path
// router.post("/createRole", initializeRoles); // Simplified path

// Route to update an existing role by ID. Accessible only by Admins after token verification.
router.put("/updateRoleById/:id", verifyAdmin, updateRole); // Simplified path

// Route to retrieve all roles. No verification middleware, hence accessible by all.
router.get("/getAllRoles", getAllRoles); // Simplified path

// Route to delete an existing role by ID. No verification middleware; might be a security concern.
router.delete("/deleteRoleById/:id", deleteRole); // Simplified path

export default router;
