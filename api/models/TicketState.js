// Import the mongoose library to interact with MongoDB
import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Defines the schema for the Audit Log model in the application.
 *
 * Audit logs are essential for keeping track of changes, who made them, and when. They can help
 * with debugging, monitoring, and ensuring accountability in the system.
 *
 * This schema captures details about changes made to tickets, such as status changes, creation,
 * updates, or deletion. It also keeps track of the user making the change.
 */

const TicketStateSchema = new Schema({
  // The action taken on the ticket (e.g., creation, status change, update, deletion)
  action: {
    type: String,
    enum: ["STATUS_CHANGE", "CREATION", "DELETION", "UPDATE"], // Allowed types of actions
    required: true,
  },
  // The user who made the change. Creates a relation between AuditLog and User model
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  // Previous value (if applicable, e.g., for status change or updates)
  oldValue: { type: String, default: "N/A" },
  // New value after the change (if applicable)
  newValue: { type: String, default: "N/A" },
  // When the change was made. Automatically set to the current date and time on creation
  timestamp: {
    type: Date,
    default: Date.now, // Default value: current timestamp
  },
});

// Explicitly setting the collection name to 'TicketState'
export default mongoose.model("TicketState", TicketStateSchema, "TicketState");
