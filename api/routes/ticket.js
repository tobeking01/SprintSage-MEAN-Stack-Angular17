import express from "express";
import {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicketById,
  deleteTicketById,
} from "../controllers/ticket.controller.js";

import { verifyToken, verifyAdmin, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

/**
 * POST /tickets
 * Route to create a new ticket.
 * It uses 'createTicket' method from Ticket Controller.
 */
router.post("/createTicket", verifyToken, verifyUser, createTicket);

/**
 * GET /tickets
 * Route to get all tickets. It uses 'getAllTickets' method from Ticket Controller.
 */
router.get("/getAllTickets", verifyToken, getAllTickets);

/**
 * GET /tickets/:id
 * Route to get a specific ticket by its ID.
 * It uses 'getTicketById' method from Ticket Controller.
 */
router.get("/getTicketById/:id", verifyToken, getTicketById);

/**
 * PUT /tickets/:id
 * Route to update a specific ticket by its ID.
 * It uses 'updateTicketById' method from Ticket Controller.
 */
router.put("/updateTicketById/:id", verifyToken, verifyUser, updateTicketById);

/**
 * DELETE /tickets/:id
 * Route to delete a specific ticket by its ID.
 * It uses 'deleteTicketById' method from Ticket Controller.
 */
router.delete(
  "/deleteTicketById/:id",
  verifyToken,
  verifyAdmin,
  deleteTicketById
);

export default router;
