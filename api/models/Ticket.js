// Importing mongoose and Schema from mongoose library for defining schemas
// and interacting with the MongoDB database.
import mongoose, { Schema } from "mongoose";

// Creating a Schema for the Ticket. This will define the structure of
// the document to be stored in the MongoDB collection.
const TicketSchema = new Schema(
  {
    // `issueDescription` field to store a detailed description of the issue in the ticket.
    issueDescription: {
      type: String,
      required: true, // This field is mandatory.
    },

    // `status` field represents the current status of the ticket. It can be either "Open", "In Progress", or "Closed".
    status: {
      type: String,
      enum: ["Open", "In Progress", "Closed"], // Enumerated list of possible statuses.
      default: "Open", // The default status is "Open" when a ticket is created.
    },

    // `severity` field indicates the impact level of the issue in the ticket.
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"], // Enumerated list of possible severities.
      required: true, // Severity is mandatory.
    },

    // `submittedBy` field stores a reference to the user who created/submitted the ticket.
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model.
      required: true, // This field is mandatory.
    },

    // `assignedTo` field stores a reference to the user who is assigned to resolve the ticket.
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model.
    },

    // `dateAdded` field stores the date and time when the ticket was created.
    dateAdded: {
      type: Date,
      default: Date.now, // Default to the current date and time.
    },

    // `lastModifiedDate` field stores the date and time when the ticket was last modified.
    lastModifiedDate: {
      type: Date,
      default: Date.now, // Default to the current date and time.
    },

    // `ticketType` field represents the type of the ticket. It can be a "Bug", "Feature Request", or "Other".
    ticketType: {
      type: String,
      enum: ["Bug", "Feature Request", "Other"], // Enumerated list of possible ticket types.
      required: true, // This field is mandatory.
    },
  },
  {
    // The `timestamps` option will add `createdAt` and `updatedAt` fields to the schema.
    // `createdAt` represents the time the document was created.
    // `updatedAt` represents the time the document was last updated.
    timestamps: true,
  }
);

// Exporting the Ticket model, allowing other parts of the application
// to interact with the 'Ticket' collection using this schema.
export default mongoose.model("Ticket", TicketSchema);
