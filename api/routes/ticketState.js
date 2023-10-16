import express from "express";
import {
  changeTicketState,
  getAllLogs,
  getLogsForTicket,
  getLogsByUser,
  deleteLog,
} from "../controllers/ticketState.controller.js";
import {
  verifyToken,
  requireRoles,
  ROLES,
} from "../middleware/verify-validate.js";

const router = express.Router();

// Middleware for verifying tokens
const selfRoleAdmin = requireRoles([ROLES.ADMIN]);

router.post("/changeTicketState", verifyToken, changeTicketState);

router.get("/logs", verifyToken, getAllLogs);
router.get("/logs/ticket/:ticketId", verifyToken, getLogsForTicket);
router.get("/logs/user/:userId", verifyToken, getLogsByUser);

// Consider authorizing only admins to delete logs for security reasons
router.delete("/log/:logId", verifyToken, selfRoleAdmin, deleteLog);

export default router;
