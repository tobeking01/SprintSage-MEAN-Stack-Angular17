// Import required modules from the mongoose library
import mongoose, { Schema } from "mongoose";

/**
 * Defines the schema for the Audit Log model in the application.
 *
 * Audit logs are essential for keeping track of changes, who made them, and when. They can help
 * with debugging, monitoring, and ensuring accountability in the system.
 *
 * This schema captures details about changes made to tickets, such as status changes, creation,
 * updates, or deletion. It also keeps track of the user making the change.
 */
const AuditLogSchema = new Schema({
  // The action taken on the ticket (e.g., creation, status change, update, deletion)
  action: {
    type: String,
    enum: ["STATUS_CHANGE", "CREATION", "DELETION", "UPDATE"], // Allowed types of actions
    required: true,
  },
  // The ID of the ticket that was changed. Creates a relation between AuditLog and Ticket model
  ticketId: {
    type: Schema.Types.ObjectId,
    ref: "Ticket", // Reference to the Ticket model
    required: true,
  },
  // The user who made the change. Creates a relation between AuditLog and User model
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  // Previous value (if applicable, e.g., for status change or updates)
  oldValue: String,
  // New value after the change (if applicable)
  newValue: String,
  // When the change was made. Automatically set to the current date and time on creation
  timestamp: {
    type: Date,
    default: Date.now, // Default value: current timestamp
  },
});

// Export the model based on the schema for use in the application
export default mongoose.model("AuditLog", AuditLogSchema);
