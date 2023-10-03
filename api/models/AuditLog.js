import mongoose, { Schema } from "mongoose";

const AuditLogSchema = new Schema({
  action: {
    type: String,
    enum: ["STATUS_CHANGE", "CREATION", "DELETION", "UPDATE"], // Types of actions to audit
    required: true,
  },
  ticketId: {
    type: Schema.Types.ObjectId,
    ref: "Ticket",
    required: true,
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  oldValue: String,
  newValue: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("AuditLog", AuditLogSchema);
