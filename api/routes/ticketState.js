import express from "express";
import {
  changeTicketState,
  getAllLogs,
  getLogsForTicket,
  getLogsByUser,
  deleteLog,
} from "../controllers/ticketState.controller.js";

const router = express.Router();

router.post("/changeTicketState", changeTicketState);

router.get("/logs", getAllLogs);
router.get("/logs/ticket/:ticketId", getLogsForTicket);
router.get("/logs/user/:userId", getLogsByUser);
router.delete("/log/:logId", deleteLog);

export default router;
