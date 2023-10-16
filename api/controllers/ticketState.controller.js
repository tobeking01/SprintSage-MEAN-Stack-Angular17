import Ticket from "../models/Ticket.js";
import AuditLog from "../models/TicketState.js";
import { sendError, sendSuccess } from "../utils/createResponse.js";

const ticketStates = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  READY_FOR_QC: "Ready for QC",
  IN_QC: "In QC",
  COMPLETED: "Completed",
  IN_BACKLOG: "In Backlog",
};

const allowedTransitions = {
  NEW: [ticketStates.IN_PROGRESS, ticketStates.IN_BACKLOG],
  IN_PROGRESS: [ticketStates.READY_FOR_QC, ticketStates.IN_BACKLOG],
  READY_FOR_QC: [ticketStates.IN_QC],
  IN_QC: [ticketStates.COMPLETED, ticketStates.IN_PROGRESS],
  COMPLETED: [],
  IN_BACKLOG: [ticketStates.IN_PROGRESS],
};

export const changeTicketState = async (req, res) => {
  const { ticketId, newState } = req.body;

  // Check if ticketId and newState are provided
  if (!ticketId || !newState) {
    return sendError(res, 400, "Both ticketId and newState are required.");
  }

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return sendError(res, 404, "Ticket not found.");
    }

    // Check if the transition is allowed
    const currentTicketState = ticket.state;
    if (!allowedTransitions[currentTicketState].includes(newState)) {
      return sendError(
        res,
        400,
        `Transition from ${currentTicketState} to ${newState} is not allowed.`
      );
    }

    // Update the ticket state
    ticket.state = newState;
    await ticket.save();

    // Create an audit log entry
    const auditLog = new AuditLog({
      action: "STATUS_CHANGE",
      ticketId: ticketId,
      changedBy: req.user.id,
      oldValue: currentTicketState,
      newValue: newState,
      timestamp: new Date(),
    });
    await auditLog.save();

    return sendSuccess(
      res,
      200,
      "Ticket state transitioned successfully.",
      auditLog
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendError(res, 400, error.message);
    }
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return sendError(res, 400, "Invalid ObjectId format.");
    }
    return sendError(res, 500, "Error processing request.");
  }
};

// Get all logs
export const getAllLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find();
    sendSuccess(res, 200, "All Audit Logs", logs);
  } catch (error) {
    sendError(res, 500, "Error fetching logs.");
  }
};

// Get logs for a specific ticket
export const getLogsForTicket = async (req, res) => {
  const { ticketId } = req.params;
  try {
    const logs = await AuditLog.find({ ticketId });
    sendSuccess(res, 200, `Logs for ticket ${ticketId}`, logs);
  } catch (error) {
    sendError(res, 500, "Error fetching logs for ticket.");
  }
};

// Get logs by a particular user
export const getLogsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const logs = await AuditLog.find({ changedBy: userId });
    sendSuccess(res, 200, `Logs for user ${userId}`, logs);
  } catch (error) {
    sendError(res, 500, "Error fetching logs by user.");
  }
};

// Delete a log
export const deleteLog = async (req, res) => {
  const { logId } = req.params;
  try {
    await AuditLog.findByIdAndDelete(logId);
    sendSuccess(res, 200, `Log ${logId} deleted successfully.`);
  } catch (error) {
    sendError(res, 500, "Error deleting log.");
  }
};
