import mongoose from "mongoose";

// Defining the Ticket schema
const TicketSchema = new mongoose.Schema({
  issueDescription: String,
  status: String,
  severity: String,
  submittedByUser: String,
  assignedToUser: String,
  projectId: String,
  ticketType: String,
});

// Creating a mongoose model for tickets
const Ticket = mongoose.model("Ticket", TicketSchema);

const ticketsData = [
  {
    issueDescription:
      "The application crashes when pressing the submit button on Project A's form",
    status: "Open",
    severity: "High",
    submittedByUser: "651b4c8dbeabf075e72bbc57", // Sus1's ID
    assignedToUser: "651b4c8dbeabf075e72bbc59", // Sus2's ID
    projectId: "651b50446bb0f906e7182a91", // Project A's ID
    ticketType: "Bug",
  },
  {
    issueDescription: "Feature X is not loading properly on Project B",
    status: "In Progress",
    severity: "Medium",
    submittedByUser: "651b4c8dbeabf075e72bbc59", // Sus2's ID
    assignedToUser: "651b4c8dbeabf075e72bbc57", // Sus1's ID
    projectId: "651b50446bb0f906e7182a8f", // Project B's ID
    ticketType: "Feature Request",
  },
  {
    issueDescription: "UI enhancement needed for Project C's dashboard",
    status: "Open",
    severity: "Low",
    submittedByUser: "651b4c8dbeabf075e72bbc5b", // Sus3's ID
    assignedToUser: "651b4c8dbeabf075e72bbc57", // Sus1's ID
    projectId: "651b50446bb0f906e7182a93", // Project C's ID
    ticketType: "Other",
  },
];

export const seedTickets = async () => {
  try {
    await Ticket.insertMany(ticketsData);
    console.log("Tickets seeded successfully!");
  } catch (error) {
    console.error("Error seeding tickets:", error);
  }
};
