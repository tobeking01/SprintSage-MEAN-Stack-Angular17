import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";
import Project from "../models/Project.js";
import TicketState from "../models/TicketState.js";
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

export const createTicket = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const {
      issueDescription,
      severity,
      assignedToUser,
      ticketType,
      projectId,
    } = req.body;

    // Validation
    const validSeverities = ["Low", "Medium", "High"];
    const validTicketTypes = ["Bug", "Feature Request", "Other"];
    if (
      !issueDescription ||
      !validSeverities.includes(severity) ||
      !validTicketTypes.includes(ticketType) ||
      !projectId
    ) {
      return res.status(400).send("Mandatory ticket data missing or invalid.");
    }

    // Check existence of Project
    const project = await mongoose.model("Project").findById(projectId);
    if (!project) {
      return res.status(404).send(`Project with ID ${projectId} not found.`);
    }

    // Check existence of Assigned User if provided
    let assignedUser = null;
    if (assignedToUser) {
      assignedUser = await mongoose.model("User").findById(assignedToUser);
      if (!assignedUser) {
        return res.status(404).send("Assigned user not found.");
      }
    }

    // Assuming req.user is set from a previous auth middleware
    if (!req.user || !req.user.id) {
      return res.status(403).send("Authentication required.");
    }

    // Create the ticket
    const Ticket = mongoose.model("Ticket");
    const newTicket = new Ticket({
      issueDescription,
      severity,
      submittedByUser: req.user.id,
      assignedToUser: assignedUser ? assignedUser._id : null,
      ticketType,
      projectId,
    });

    // Save the ticket
    await newTicket.save();

    // Log ticket creation in TicketState
    const ticketState = new TicketState({
      action: "CREATION",
      changedBy: req.user.id,
      newValue: `Ticket with ID ${newTicket._id} created.`,
    });
    await ticketState.save();

    // Add the ticket ID to the project's tickets array
    project.tickets.push(newTicket._id);
    await project.save();

    // Respond with success
    res.status(201).send({
      message: "Ticket successfully created.",
      ticket: newTicket,
      project: project,
      ticketState: ticketState, // send the ticketState in the response if needed
    });
  } catch (error) {
    console.error("Error encountered while creating a ticket:", error);
    res.status(500).send("Internal Server Error while creating a ticket!");
  }
};

export const getAllTicketsByProjectId = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return sendError(res, 400, "Invalid Project ID");
    }

    const projectWithTickets = await Project.findById(projectId);
    console.log("Ticket references in project:", projectWithTickets.tickets);

    if (!projectWithTickets) {
      return sendError(res, 404, "Project not found");
    }

    const TicketModel = mongoose.model("Ticket");

    // Modify the promise to populate the submittedByUser and assignedToUser fields
    const ticketsPromises = projectWithTickets.tickets.map((ticketRef) =>
      TicketModel.findById(ticketRef._id)
        .populate("submittedByUser", "firstName lastName") // assuming 'submittedByUser' is the correct path and it holds a reference to a User object
        .populate("assignedToUser", "firstName lastName") // assuming 'assignedToUser' is the correct path and it holds a reference to a User object
        .exec()
    );

    const tickets = await Promise.all(ticketsPromises);

    // Remove any undefined entries due to not found tickets, if necessary
    const validTickets = tickets.filter((ticket) => ticket !== null);
    console.log("Valid tickets after fetching and filtering:", validTickets);

    const responseData = {
      tickets: validTickets.map((ticket) => {
        // You might need to transform the ticket object if necessary
        return {
          ...ticket.toObject(), // Convert the Mongoose document to a plain JavaScript object
          // Transform submittedByUser and assignedToUser to include only firstName and lastName
          submittedByUser: {
            firstName: ticket.submittedByUser.firstName,
            lastName: ticket.submittedByUser.lastName,
          },
          assignedToUser: {
            firstName: ticket.assignedToUser.firstName,
            lastName: ticket.assignedToUser.lastName,
          },
        };
      }),
    };
    console.log("Response", responseData);

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
