import Ticket from "../models/Ticket.js";
import Project from "../models/Project.js";
import { CreateError } from "../utils/error.js";
import { CreateSuccess } from "../utils/success.js";

const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "CLOSED", "REJECTED"];

// Controller to create a new ticket.
export const createTicket = async (req, res, next) => {
  try {
    const {
      issueDescription,
      status,
      severity,
      submittedByUser,
      assignedToUser,
      projectId,
      ticketType,
    } = req.body;

    // Ensure mandatory fields are provided.
    if (
      !issueDescription ||
      !severity ||
      !submittedByUser ||
      !projectId ||
      !ticketType
    ) {
      return next(
        CreateError(400, "Mandatory ticket data missing or invalid.")
      );
    }

    // Inside createTicket function
    if (!TICKET_STATUSES.includes(status)) {
      return next(CreateError(400, "Invalid ticket status."));
    }
    // Validate projectId
    const project = await Project.findById(projectId);
    if (!project) {
      return next(CreateError(400, "Invalid project ID."));
    }
    // Instantiate a new Ticket object with provided data.
    const newTicket = new Ticket({
      issueDescription,
      status,
      severity,
      submittedByUser,
      assignedToUser,
      projectId,
      ticketType,
    });

    // Save the ticket object to the database.
    await newTicket.save();

    res
      .status(201)
      .json(CreateSuccess(201, "Ticket successfully created.", newTicket));
  } catch (error) {
    console.error("Error encountered while creating a ticket:", error);
    next(CreateError(500, "Internal Server Error while creating a ticket."));
  }
};

// Controller to fetch all tickets.
export const getAllTickets = async (req, res, next) => {
  try {
    // Retrieve all tickets and populate details of related 'submittedBy' and 'assignedTo' users.
    const tickets = await Ticket.find()
      .populate("submittedByUser")
      .populate("assignedToUser");

    res
      .status(200)
      .json(CreateSuccess(200, "Tickets successfully retrieved.", tickets));
  } catch (error) {
    console.error("Error encountered while fetching all tickets:", error);
    next(CreateError(500, "Internal Server Error while fetching tickets."));
  }
};

// Controller to fetch a specific ticket by its ID.
export const getTicketById = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    // Fetch the ticket by ID and populate user details.
    const ticket = await Ticket.findById(ticketId)
      .populate("submittedByUser")
      .populate("assignedToUser")
      .populate("projectId"); // Populating the project data

    // If the ticket doesn't exist, return a 404 error.
    if (!ticket) {
      return next(CreateError(404, "Ticket not found."));
    }

    res
      .status(200)
      .json(CreateSuccess(200, "Ticket successfully retrieved.", ticket));
  } catch (error) {
    console.error("Error encountered while fetching ticket by ID:", error);
    next(
      CreateError(500, "Internal Server Error while fetching the ticket by ID.")
    );
  }
};

// Controller to update a specific ticket by its ID.
export const updateTicketById = async (req, res, next) => {
  try {
    const ticketId = req.params.id;

    // Update the ticket using the provided data and return the updated ticket.
    const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, req.body, {
      new: true,
    })
      .populate("submittedByUser")
      .populate("assignedToUser")
      .populate("projectId"); // Populating the project data

    // If the ticket doesn't exist, return a 404 error.
    if (!updatedTicket) {
      return next(CreateError(404, "Ticket not found for update."));
    }

    res
      .status(200)
      .json(CreateSuccess(200, "Ticket successfully updated.", updatedTicket));
  } catch (error) {
    console.error("Error encountered while updating the ticket:", error);
    next(CreateError(500, "Internal Server Error while updating the ticket."));
  }
};

// Controller to delete a ticket by its ID.
export const deleteTicketById = async (req, res, next) => {
  try {
    const ticketId = req.params.id;

    // Delete the ticket by its ID.
    const deletedTicket = await Ticket.findByIdAndDelete(ticketId);

    // If the ticket doesn't exist, return a 404 error.
    if (!deletedTicket) {
      return next(CreateError(404, "Ticket not found for deletion."));
    }

    res
      .status(200)
      .json(CreateSuccess(200, "Ticket successfully deleted.", deletedTicket));
  } catch (error) {
    console.error("Error encountered while deleting the ticket:", error);
    next(CreateError(500, "Internal Server Error while deleting the ticket."));
  }
};
