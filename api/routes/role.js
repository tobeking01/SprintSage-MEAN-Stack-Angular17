// role.router.js
import express from "express";
import {
  getAllRoles,
  updateRole,
  deleteRole,
} from "../controllers/role.controller.js";
import { verifyAdmin } from "../utils/verify-validate.js";

const router = express.Router();

// Route to initialize  a new role. Accessible only by Admins after token verification.
// router.post("/createRole", verifyAdmin, createRole);
// router.post("/createRole", initializeRoles);

// Route to update an existing role by ID. Accessible only by Admins after token verification.
router.put("/updateRoleById/:id", verifyAdmin, updateRole);

// Route to retrieve all roles.
router.get("/getAllRoles", getAllRoles);

// Route to delete an existing role by ID. No verification middleware;
router.delete("/deleteRoleById/:id", deleteRole);

export default router;
