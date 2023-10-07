// Importing the necessary modules and utilities
import Ticket from "../models/Ticket.js";
import Project from "../models/Project.js";
import { sendError, sendSuccess } from "../utils/createResponse.js";
import User from "../models/User.js";

// An array to represent possible statuses a ticket can have
const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "CLOSED", "REJECTED"];

// Controller responsible for creating a new ticket
export const createTicket = async (req, res, next) => {
  try {
    // Destructuring fields from the request body
    const {
      issueDescription,
      status,
      severity,
      submittedByUser,
      assignedToUser,
      projectId,
      ticketType,
    } = req.body;

    // Validating that mandatory fields are present
    if (
      !issueDescription ||
      !severity ||
      !submittedByUser ||
      !projectId ||
      !ticketType
    ) {
      return sendError(res, 400, "Mandatory ticket data missing or invalid.");
    }

    // Validating the status of the ticket against predefined statuses
    if (!TICKET_STATUSES.includes(status)) {
      return sendError(res, 400, "Invalid ticket status.");
    }

    // Validating the project ID against stored projects in the database
    const project = await Project.findById(projectId);
    if (!project) {
      return sendError(res, 400, "Invalid project ID.");
    }
    const assignedUser = await User.findById(assignedToUser);
    if (!assignedToUser) {
      return sendError(res, 400, "Assigned user does not exist.");
    }
    // Creating a new ticket instance using the Ticket model
    const newTicket = new Ticket({
      issueDescription,
      status,
      severity,
      submittedByUser,
      assignedToUser,
      projectId,
      ticketType,
    });

    // Saving the newly created ticket instance to the database
    await newTicket.save();

    sendSuccess(res, 201, "Ticket successfully created.", [newTicket]);
  } catch (error) {
    console.error("Error encountered while creating a ticket:", error);
    sendError(res, 500, "Internal Server Error while creating a ticket!");
  }
};

// Controller responsible for fetching all tickets from the database
export const getAllTickets = async (req, res, next) => {
  try {
    // Setting pagination parameters
    const limit = parseInt(req.query.limit) || 10; // number of records per page
    const page = parseInt(req.query.page) || 1; // current page number
    const skip = (page - 1) * limit; // number of records to skip for pagination

    // Querying the database for all tickets
    // and populating related fields like 'submittedByUser' and 'assignedToUser'
    const tickets = await Ticket.find()
      .populate("submittedByUser")
      .populate("assignedToUser")
      .limit(limit)
      .skip(skip);

    const totalTickets = await Ticket.countDocuments();

    // Constructing response data which includes the fetched tickets and pagination details
    const responseData = {
      tickets: tickets,
      meta: {
        currentPage: page,
        perPage: limit,
        totalItems: totalTickets,
        totalPages: Math.ceil(totalTickets / limit),
      },
    };

    sendSuccess(res, 200, "Tickets successfully retrieved.", responseData);
  } catch (error) {
    console.error("Error encountered while fetching all tickets:", error);
    sendError(res, 500, "Internal Server Error while fetching tickets!");
  }
};

// Controller responsible for fetching a specific ticket by its ID
export const getTicketById = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    // Querying the database for the ticket with the provided ID
    // and populating related fields for comprehensive details
    const ticket = await Ticket.findById(ticketId)
      .populate("submittedByUser")
      .populate("assignedToUser")
      .populate("projectId");

    // If the ticket with the given ID is not found, an error is returned
    if (!ticket) {
      return sendError(res, 404, "Ticket not found.");
    }

    sendSuccess(res, 200, "Ticket successfully retrieved.", [ticket]);
  } catch (error) {
    console.error("Error encountered while fetching ticket by ID:", error);
    sendError(res, 500, "Internal Server Error while fetching tickets by ID!");
  }
};

// Controller responsible for updating a specific ticket by its ID
export const updateTicketById = async (req, res, next) => {
  try {
    const ticketId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return sendError(res, 400, "Invalid project ID.");
    }
    // Updating the ticket in the database using provided data
    // and returning the updated ticket details with populated fields
    const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, req.body, {
      new: true,
    })
      .populate("submittedByUser")
      .populate("assignedToUser")
      .populate("projectId");

    // If the ticket with the given ID is not found, an error is returned
    if (!updatedTicket) {
      return next(sendError(res, 404, "Ticket not found for update."));
    }

    sendSuccess(res, 200, "Ticket successfully updated.", [updatedTicket]);
  } catch (error) {
    console.error("Error encountered while updating the ticket:", error);
    sendError(res, 500, "Internal Server Error while updating the ticket!");
  }
};

// Controller responsible for deleting a ticket from the database by its ID
export const deleteTicketById = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    // Deleting the ticket with the provided ID from the database
    const deletedTicket = await Ticket.findByIdAndDelete(ticketId);

    // If the ticket with the given ID is not found, an error is returned
    if (!deletedTicket) {
      return sendError(res, 404, "Ticket not found for deletion.");
    }

    sendSuccess(res, 200, "Ticket successfully deleted.", [deletedTicket]);
  } catch (error) {
    console.error("Error encountered while deleting the ticket:", error);
    sendError(res, 500, "Internal Server Error while deleting the ticket!");
  }
};
