import express from "express";
import {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicketById,
  deleteTicketById,
} from "../controllers/ticket.controller.js";
import {
  verifyToken,
  requireRoles,
  ROLES,
} from "../middleware/verify-validate.js";

const router = express.Router();

// Middleware for verifying tokens
const selfRoles = requireRoles([ROLES.STUDENT, ROLES.PROFESSOR, ROLES.ADMIN]);
const selfRoleAdmin = requireRoles([ROLES.ADMIN]);

/**
 * POST /tickets
 * Route to create a new ticket.
 * It uses 'createTicket' method from Ticket Controller.
 */
router.post("/createTicket/", verifyToken, selfRoles, createTicket);

/**
 * GET /tickets
 * Route to get all tickets. It uses 'getAllTickets' method from Ticket Controller.
 */
router.get("/getAllTickets/", verifyToken, selfRoles, getAllTickets);

/**
 * GET /tickets/:id
 * Route to get a specific ticket by its ID.
 * It uses 'getTicketById' method from Ticket Controller.
 */
router.get("/getTicketById/:id", verifyToken, selfRoles, getTicketById);

/**
 * PUT /tickets/:id
 * Route to update a specific ticket by its ID.
 * It uses 'updateTicketById' method from Ticket Controller.
 */
router.put("/updateTicketById/:id", verifyToken, selfRoles, updateTicketById);

/**
 * DELETE /tickets/:id
 * Route to delete a specific ticket by its ID.
 * It uses 'deleteTicketById' method from Ticket Controller.
 */
router.delete(
  "/deleteTicketById/:id",
  verifyToken,
  selfRoleAdmin,
  deleteTicketById
);

export default router;
