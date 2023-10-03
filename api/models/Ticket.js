import mongoose, { Schema } from "mongoose";
import AuditLog from "./AuditLog.js";

const TicketSchema = new Schema(
  {
    issueDescription: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Closed"],
      default: "Open",
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },

    submittedByUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedToUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    ticketType: {
      type: String,
      enum: ["Bug", "Feature Request", "Other"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Logging and Auditing
// Logging and Auditing
TicketSchema.pre("save", async function (next) {
  try {
    if (this.isModified("status")) {
      const originalDoc = await this.constructor.findOne(this._id);
      const oldValue = originalDoc ? originalDoc.status : null;

      const audit = new AuditLog({
        action: "STATUS_CHANGE",
        ticketId: this._id,
        changedBy: this.submittedByUser,
        oldValue: oldValue,
        newValue: this.status,
      });

      await audit.save();
    }
    next();
  } catch (err) {
    console.error("Error during audit log creation:", err);
    next(err);
  }
});

export default mongoose.model("Ticket", TicketSchema);
