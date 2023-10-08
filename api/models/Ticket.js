// Import the mongoose library to interact with MongoDB
import mongoose from "mongoose";
const { Schema } = mongoose;

// Define the schema for the "Ticket" collection, which represents issues, bugs, or tasks within a system.
const TicketSchema = new Schema(
  {
    // Description of the ticketed issue, bug, or task.
    issueDescription: {
      type: String,
      required: true,
    },

    // Indicates the importance or impact of the ticketed issue.
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },

    // User who reported the issue.
    submittedByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // User who is assigned to resolve the issue.
    assignedToUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Team associated with the ticket, if any.
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },

    // Project in which the ticketed issue occurs or is related to.
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    // Categorization of the ticket, for organizational purposes.
    ticketType: {
      type: String,
      enum: ["Bug", "Feature Request", "Other"],
      required: true,
    },

    // Current status or phase of the ticket in its lifecycle.
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
    // Automatic management of creation and modification timestamps for each ticket.
    timestamps: true,
    autoIndex: true,
  }
);

// Middleware to validate that the user submitting the ticket is associated with the related project.
TicketSchema.pre("save", async function (next) {
  const user = await mongoose.model("User").findById(this.submittedByUser);
  const project = await mongoose.model("Project").findById(this.project);

  // Check if user is part of any team that's associated with the project
  const isUserAssociatedWithProject = user.teams.some((teamId) =>
    project.teams.includes(teamId)
  );

  if (!isUserAssociatedWithProject) {
    throw new Error("User not associated with the project through any team");
  }

  next();
});

// Middleware to log the creation of a new ticket.
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

// Middleware to handle deletions and cleanup related references when a ticket is removed.
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

// Middleware to log ticket status changes.
TicketSchema.pre("save", async function (next) {
  if (this.isModified("state")) {
    const audit = new TicketState({
      action: "STATUS_CHANGE",
      ticketId: this._id,
      changedBy: this.submittedByUser,
      oldValue: this.previous("state"),
      newValue: this.state,
    });
    await audit.save();
  }
  next();
});

// Instance methods to easily change the state/status of a ticket.
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

// Export the defined schema as the "Ticket" model.
export default mongoose.model("Ticket", TicketSchema, "Ticket");
