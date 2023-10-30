import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { sendError, sendSuccess } from "../utils/createResponse.js";
const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "CLOSED", "REJECTED"];

// Almost good needs testing
const getTicketByIdHelper = async (ticketId) => {
  const ticket = await mongoose
    .model("Ticket")
    .findById(ticketId)
    .populate("submittedByUser")
    .populate("assignedToUser")
    .populate({
      path: "team",
      populate: {
        path: "teamMembers.user",
        model: "User",
        populate: {
          path: "roles",
          model: "Role",
        },
      },
    })
    .populate("project");

  return ticket;
};

export const createTicket = async (req, res, next) => {
  try {
    const {
      issueDescription,
      severity,
      assignedToUser,
      projectId,
      ticketType,
    } = req.body;

    const status = "New"; // Default value
    if (!issueDescription || !severity || !projectId || !ticketType) {
      return sendError(res, 400, "Mandatory ticket data missing or invalid.");
    }

    const project = await Project.findById(projectId);
    const assignedUser = assignedToUser
      ? await User.findById(assignedToUser)
      : null;

    if (!project || (assignedToUser && !assignedUser)) {
      return sendError(res, 400, "Invalid project or assigned user ID.");
    }

    const newTicket = new Ticket({
      issueDescription,
      severity,
      submittedByUser: req.user.id,
      assignedToUser,
      project: projectId,
      ticketType,
      state: status,
    });

    await newTicket.save();

    sendSuccess(res, 201, "Ticket successfully created.", [newTicket]);
  } catch (error) {
    console.error("Error encountered while creating a ticket:", error);
    sendError(res, 500, "Internal Server Error while creating a ticket!");
  }
};

export const getAllTickets = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const tickets = await Ticket.find()
      .populate("submittedByUser")
      .populate("assignedToUser")
      .limit(limit)
      .skip(skip);

    const totalTickets = await Ticket.countDocuments();

    const responseData = {
      tickets,
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

export const getTicketById = async (req, res, next) => {
  try {
    const ticketId = req.params.id;

    // Use the getTicketByIdHelper function to fetch the ticket.
    // This function will provide a richer object with more populated fields.
    const ticket = await getTicketByIdHelper(ticketId);

    if (!ticket) {
      return sendError(res, 404, "Ticket not found.");
    }

    sendSuccess(res, 200, "Ticket successfully retrieved.", ticket);
  } catch (error) {
    console.error("Error encountered while fetching ticket by ID:", error);
    next(
      sendError(res, 500, "Internal Server Error while fetching tickets by ID!")
    );
  }
};

export const updateTicketById = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const { projectId, status } = req.body;

    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return sendError(res, 400, "Invalid project ID.");
      }
    }

    if (status && !TICKET_STATUSES.includes(status)) {
      return sendError(res, 400, "Invalid ticket status.");
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, req.body, {
      new: true,
    })
      .populate("submittedByUser")
      .populate("assignedToUser")
      .populate("project");

    if (!updatedTicket) {
      return sendError(res, 404, "Ticket not found for update.");
    }

    sendSuccess(res, 200, "Ticket successfully updated.", [updatedTicket]);
  } catch (error) {
    console.error("Error encountered while updating the ticket:", error);
    sendError(res, 500, "Internal Server Error while updating the ticket!");
  }
};

export const deleteTicketById = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const deletedTicket = await Ticket.findByIdAndDelete(ticketId);

    if (!deletedTicket) {
      return sendError(res, 404, "Ticket not found for deletion.");
    }

    sendSuccess(res, 200, "Ticket successfully deleted.", [deletedTicket]);
  } catch (error) {
    console.error("Error encountered while deleting the ticket:", error);
    sendError(res, 500, "Internal Server Error while deleting the ticket!");
  }
};
