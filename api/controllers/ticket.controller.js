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
    const { issueDescription, severity, assignedToUser, ticketType } = req.body;

    // Validate mandatory fields and enum values
    if (
      !issueDescription ||
      !severity ||
      !ticketType ||
      !["Low", "Medium", "High"].includes(severity) ||
      !["Bug", "Feature Request", "Other"].includes(ticketType)
    ) {
      return res.status(400).send("Mandatory ticket data missing or invalid.");
    }

    // Verify the project exists and the user is authorized to add tickets to it
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(400).send("Invalid project ID.");
    }

    // Verify the assigned user exists if provided
    const assignedUser = assignedToUser
      ? await User.findById(assignedToUser)
      : null;
    if (assignedToUser && !assignedUser) {
      return res.status(400).send("Invalid assigned user ID.");
    }

    // The user submitting the ticket is taken from the authenticated user context
    const submittedByUser = req.user.id;

    // Create the ticket
    const newTicket = new Ticket({
      issueDescription,
      severity,
      submittedByUser,
      assignedToUser: assignedUser ? assignedUser._id : null,
      ticketType,
      // state is defaulted to "New" in the schema, no need to set here
    });

    await newTicket.save();
    // Now add the ticket to the project's tickets array
    project.tickets.push(newTicket._id);
    await project.save();

    // Respond with success and the new ticket data
    res.status(201).send({
      message: "Ticket successfully created.",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error encountered while creating a ticket:", error);
    res.status(500).send("Internal Server Error while creating a ticket!");
  }
};

export const getAllTicketsByProjectId = async (req, res, next) => {
  try {
    const projectId = req.params.projectId; // Assuming projectId is a route parameter

    // Validate projectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return sendError(res, 400, "Invalid Project ID");
    }

    // Find the project by ID and populate the ticket information
    const projectWithTickets = await Project.findById(projectId).populate({
      path: "tickets.ticket",
      model: "Ticket", // Ensure this matches the name you've given your ticket model
    });

    // Check if the project exists
    if (!projectWithTickets) {
      return sendError(res, 404, "Project not found");
    }

    // Extract tickets from the populated project document
    const tickets = projectWithTickets.tickets.map((t) => t.ticket);

    const responseData = {
      tickets,
    };

    sendSuccess(
      res,
      200,
      "Tickets successfully retrieved by project ID.",
      responseData
    );
  } catch (error) {
    console.error(
      "Error encountered while fetching tickets by project ID:",
      error
    );
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
