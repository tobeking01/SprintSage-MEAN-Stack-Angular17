// role.router.js
import express from "express";
import {
  getAllRoles,
  updateRoleById,
  getRoleNameById,
  deleteRole,
} from "../controllers/role.controller.js";
import { verifyAdmin } from "../middleware/verify-validate.js";
import { verifyToken } from "../middleware/verify-validate.js";

const router = express.Router();

// Route to initialize  a new role. Accessible only by Admins after token verification.
// router.post("/createRole", verifyAdmin, createRole);
// router.post("/createRole", initializeRoles);

// Route to update an existing role by ID. Accessible only by Admins after token verification.
router.put("/updateRoleById/:id", verifyToken, updateRoleById);

// Route to retrieve all roles.
router.get("/getAllRoles", verifyToken, getAllRoles);

router.get("/getRoleNameById/:roleId/name", verifyToken, getRoleNameById);

// Route to delete an existing role by ID. No verification middleware;
router.delete("/deleteRoleById/:id", verifyToken, verifyAdmin, deleteRole);

export default router;
