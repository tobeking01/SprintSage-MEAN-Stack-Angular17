import Ticket from "../models/Ticket.js";
import { CreateError } from "../utils/error.js";
import { CreateSuccess } from "../utils/success.js";

/**
 * @async
 * @function createTicket
 * @description Controller to create a new ticket.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const createTicket = async (req, res, next) => {
  try {
    // Extract ticket data from request body.
    const { issueDescription, severity, submittedBy, assignedTo, ticketType } =
      req.body;

    // Validate mandatory ticket data.
    if (!issueDescription || !severity || !submittedBy || !ticketType) {
      return next(CreateError(400, "Invalid ticket data."));
    }

    // Create and save the new Ticket instance to the database.
    const newTicket = new Ticket({
      issueDescription,
      severity,
      submittedBy,
      assignedTo,
      ticketType,
    });
    await newTicket.save();

    // Respond with a success message.
    res.status(201).json(CreateSuccess(201, "Ticket Created!", newTicket));
  } catch (error) {
    console.error("Error creating ticket:", error); // Log the error for debugging purposes.
    next(CreateError(500, "Internal Server Error!")); // Forward the error to the error-handling middleware.
  }
};

/**
 * @async
 * @function getAllTickets
 * @description Controller to fetch all tickets from the database.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const getAllTickets = async (req, res, next) => {
  try {
    // Fetching all tickets from the database.
    const tickets = await Ticket.find()
      .populate("submittedBy")
      .populate("assignedTo");

    // Responding with the fetched tickets.
    res
      .status(200)
      .json(CreateSuccess(200, "Tickets fetched successfully!", tickets));
  } catch (error) {
    console.error("Error fetching tickets:", error); // Log the error for debugging purposes.
    next(CreateError(500, "Internal Server Error!")); // Forward the error to the error-handling middleware.
  }
};

/**
 * @async
 * @function getTicketById
 * @description Controller to fetch a specific ticket by its ID from the database.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params; // Extracting the ticket ID from the route parameters.

    // Fetching the ticket from the database by ID.
    const ticket = await Ticket.findById(id)
      .populate("submittedBy")
      .populate("assignedTo");

    if (!ticket) return next(CreateError(404, "Ticket not found!"));

    // Responding with the fetched ticket.
    res
      .status(200)
      .json(CreateSuccess(200, "Ticket fetched successfully!", ticket));
  } catch (error) {
    console.error("Error fetching ticket:", error); // Log the error for debugging purposes.
    next(CreateError(500, "Internal Server Error!")); // Forward the error to the error-handling middleware.
  }
};

/**
 * @async
 * @function updateTicketById
 * @description Controller to update a specific ticket by its ID in the database.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const updateTicketById = async (req, res, next) => {
  try {
    const { id } = req.params; // Extracting the ticket ID from the route parameters.

    // Updating the ticket in the database and returning the updated ticket document.
    const updatedTicket = await Ticket.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .populate("submittedBy")
      .populate("assignedTo");

    if (!updatedTicket) return next(CreateError(404, "Ticket not found!"));

    // Responding with the updated ticket.
    res
      .status(200)
      .json(CreateSuccess(200, "Ticket updated successfully!", updatedTicket));
  } catch (error) {
    console.error("Error updating ticket:", error); // Log the error for debugging purposes.
    next(CreateError(500, "Internal Server Error!")); // Forward the error to the error-handling middleware.
  }
};

/**
 * @async
 * @function deleteTicketById
 * @description Controller to delete a specific ticket by its ID from the database.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const deleteTicketById = async (req, res, next) => {
  try {
    const { id } = req.params; // Extracting the ticket ID from the route parameters.

    // Deleting the ticket from the database by ID.
    const deletedTicket = await Ticket.findByIdAndDelete(id);

    if (!deletedTicket) return next(CreateError(404, "Ticket not found!"));

    // Responding with the deleted ticket.
    res
      .status(200)
      .json(CreateSuccess(200, "Ticket deleted successfully!", deletedTicket));
  } catch (error) {
    console.error("Error deleting ticket:", error); // Log the error for debugging purposes.
    next(CreateError(500, "Internal Server Error!")); // Forward the error to the error-handling middleware.
  }
};
