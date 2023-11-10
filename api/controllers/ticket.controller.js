import mongoose from "mongoose";
import Project from "../models/Project.js";
import Ticket from "../models/Ticket.js";
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
    const updateData = req.body;

    // Validate project ID if provided
    if (updateData.projectId) {
      const project = await Project.findById(updateData.projectId);
      if (!project) {
        return sendError(res, 400, "Invalid project ID.");
      }
    }

    // Validate ticket status if provided
    if (updateData.status && !TICKET_STATUSES.includes(updateData.status)) {
      return sendError(res, 400, "Invalid ticket status.");
    }

    // If assignedToUser is provided and invalid, return an error
    if (
      updateData.assignedToUser &&
      !mongoose.Types.ObjectId.isValid(updateData.assignedToUser)
    ) {
      return sendError(res, 400, "Invalid assignedToUser ID.");
    }

    // Remove assignedToUser from updateData if it's null or undefined
    if (updateData.assignedToUser == null) {
      delete updateData.assignedToUser;
    }

    // Proceed to update the ticket
    const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, updateData, {
      new: true,
    })
      .populate("submittedByUser")
      .populate("assignedToUser");

    if (!updatedTicket) {
      return sendError(res, 404, "Ticket not found for update.");
    }

    sendSuccess(res, 200, "Ticket successfully updated.", [updatedTicket]);
  } catch (error) {
    console.error("Error encountered while updating the ticket:", error);
    sendError(res, 500, "Internal Server Error while updating the ticket!");
  }
};

// Controller function to delete a ticket by ID
export const deleteTicketById = async (req, res) => {
  try {
    const ticketId = req.params.id;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).send({ message: "Ticket not found." });
    }

    // Log the deletion in TicketState
    await new TicketState({
      action: "DELETION",
      changedBy: ticket.submittedByUser,
      ticketId: ticket._id,
      newValue: "Deleted",
      oldValue: ticket.state,
    }).save();

    // Remove the ticket from the Project
    const projectUpdateResult = await Project.updateMany(
      { "tickets._id": ticket._id }, // targeting the `_id` field within the tickets array
      { $pull: { tickets: { _id: ticket._id } } } // pulling the object by its `_id`
    );

    console.log("Project update result:", projectUpdateResult);

    // Delete the ticket
    const deleteResult = await Ticket.deleteOne({ _id: ticket._id });

    console.log("Ticket delete result:", deleteResult);

    return res.status(200).send({
      message:
        "Ticket deleted successfully and reference removed from project.",
    });
  } catch (error) {
    console.error("Error encountered while deleting the ticket:", error);
    return res.status(500).send({ message: "Internal Server Error." });
  }
};

export const getTicketsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming the user's ID will be passed as a URL parameter

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return sendError(res, 400, "Invalid User ID");
    }

    const tickets = await Ticket.find({ submittedByUser: userId })
      .populate("submittedByUser", "firstName lastName email") // Populate if necessary
      .populate("assignedToUser", "firstName lastName email") // Populate if necessary
      .exec();

    if (!tickets) {
      return sendError(res, 404, "No tickets found for the given user.");
    }

    sendSuccess(res, 200, "Tickets retrieved successfully.", { tickets });
  } catch (error) {
    console.error(
      "Error encountered while fetching tickets by user ID:",
      error
    );
    sendError(
      res,
      500,
      "Internal Server Error while fetching tickets by user ID!"
    );
  }
};
