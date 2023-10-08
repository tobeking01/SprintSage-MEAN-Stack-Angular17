// Import necessary modules
import mongoose, { Schema } from "mongoose";
import TicketState from "./TicketState.js";

const TicketSchema = new Schema(
  {
    // Description of the issue associated with the ticket
    issueDescription: {
      type: String,
      required: true, // This field is mandatory for every ticket
    },

    // Severity level of the ticket (e.g., "Low," "Medium," "High")
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"], // Allowed severity values
      required: true, // Severity level is required
    },

    // User who submitted the ticket (reference to User model)
    submittedByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },

    // User assigned to work on the ticket (reference to User model)
    assignedToUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
    },

    // Project to which the ticket belongs (reference to Project model)
    project: {
      type: mongoose.Schema.Types.ObjectId,
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
      ],
      default: "New",
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
    // Enable automatic indexing for the schema
    autoIndex: true,
  }
);

// Middleware for subMitBy
TicketSchema.pre("save", async function (next) {
  if (this.isNew) {
    const audit = new TicketState({
      action: "CREATION",
      ticketId: this._id,
      changedBy: this.submittedByUser,
    });
    await audit.save();
  }
  next();
});

TicketSchema.pre("remove", async function (next) {
  try {
    // Deleting all audit logs related to this ticket
    await TicketState.deleteMany({ ticketId: this._id });

    // Remove this ticket from its associated project's ticket list
    await mongoose
      .model("Project")
      .updateOne({ tickets: this._id }, { $pull: { tickets: this._id } });

    next();
  } catch (error) {
    next(error);
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
