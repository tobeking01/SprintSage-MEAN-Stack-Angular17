// Import necessary modules
import mongoose, { Schema } from "mongoose";
import AuditLog from "./AuditLog.js";

/**
 * Ticket Schema Definition
 *
 * This schema represents tickets within the system. Tickets might be associated with
 * reported issues, feature requests, etc. Each ticket contains information about its
 * description, status, severity, the user who submitted it, and more.
 */

const TicketSchema = new Schema(
  {
    // Description of the issue associated with the ticket
    issueDescription: {
      type: String,
      required: true, // This field is mandatory for every ticket
    },

    // Status of the ticket (e.g., "Open," "In Progress," "Closed")
    status: {
      type: String,
      enum: ["Open", "In Progress", "Closed"], // Allowed status values
      default: "Open", // Default status when not specified
    },

    // Severity level of the ticket (e.g., "Low," "Medium," "High")
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"], // Allowed severity values
      required: true, // Severity level is required
    },

    // User who submitted the ticket (reference to User model)
    submittedByUser: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },

    // User assigned to work on the ticket (reference to User model)
    assignedToUser: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
    },

    // Project to which the ticket belongs (reference to Project model)
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project", // Reference to the Project model
      required: true,
    },

    // Type of the ticket (e.g., "Bug," "Feature Request," "Other")
    ticketType: {
      type: String,
      enum: ["Bug", "Feature Request", "Other"], // Allowed ticket types
      required: true,
    },

    // Current state of the ticket (e.g., "New," "In Progress," "Completed")
    state: {
      type: String,
      enum: [
        "New",
        "In Progress",
        "Ready for QC",
        "In QC",
        "Completed",
        "In Backlog",
      ], // Allowed state values
      default: "New", // Default state when not specified
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

/**
 * Pre-save middleware to handle auditing for tickets.
 *
 * This function is triggered before a ticket is saved in the database. It checks if
 * the ticket's status has been modified and, if so, logs this change in an audit log.
 */

TicketSchema.pre("save", async function (next) {
  try {
    // Check if the "status" field is modified during save
    if (this.isModified("status")) {
      // Fetch the original document before the update
      const originalDoc = await this.constructor.findOne(this._id);
      const oldValue = originalDoc ? originalDoc.status : null;

      // Create an audit log entry for the status change
      const audit = new AuditLog({
        action: "STATUS_CHANGE",
        ticketId: this._id,
        changedBy: this.submittedByUser,
        oldValue: oldValue,
        newValue: this.status,
      });

      // Save the audit log entry to the database
      await audit.save();
    }
    next();
  } catch (err) {
    console.error("Error during audit log creation:", err);
    next(err); // Pass any errors to the next middleware or operation
  }
});

// Methods to transition the ticket state
TicketSchema.methods.inProgress = async function () {
  // Update the state to "In Progress" and save
  this.state = "In Progress";
  await this.save();
  return this; // Return the updated ticket
};

TicketSchema.methods.readyForQC = async function () {
  // Update the state to "Ready for QC" and save
  this.state = "Ready for QC";
  await this.save();
  return this; // Return the updated ticket
};

TicketSchema.methods.inQC = async function () {
  // Update the state to "In QC" and save
  this.state = "In QC";
  await this.save();
  return this; // Return the updated ticket
};

TicketSchema.methods.completed = async function () {
  // Update the state to "Completed" and save
  this.state = "Completed";
  await this.save();
  return this; // Return the updated ticket
};

TicketSchema.methods.inBacklog = async function () {
  // Update the state to "In Backlog" and save
  this.state = "In Backlog";
  await this.save();
  return this; // Return the updated ticket
};

// Create the Ticket model using the schema
export default mongoose.model("Ticket", TicketSchema);
