import axios from "axios";

const baseURL = "http://localhost:8800/api/";
const endpoint = "ticket/createTicket";
const fullURL = baseURL + endpoint;

const seedTickets = [
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

// Seed the data
const seedDataUsingAPI = async () => {
  try {
    for (const ticket of seedTickets) {
      const response = await axios.post(fullURL, ticket);
      console.log("Ticket created:", response.data);
    }
    console.log("All tickets seeded successfully!");
  } catch (error) {
    console.error(
      "Error seeding tickets using API:",
      error.response ? error.response.data : error.message
    );
  }
};

seedDataUsingAPI();
