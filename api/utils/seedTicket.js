import axios from "axios";

// Create an Axios instance with a baseURL
const api = axios.create({ baseURL: "http://localhost:8800/" });

const endpoint = "tickets/createTicket";

const tickets = [
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

// api
//   .post(endpoint, ticketData)
//   .then((response) => {
//     console.log("Ticket created:", response.data);
//   })
//   .catch((error) => {
//     console.error("Error creating ticket:", error);
//   });

export const seedTickets = async () => {
  for (const ticket of tickets) {
    try {
      const response = await api.post(endpoint, ticket);
      console.log("Ticket created:", response.data);
    } catch (error) {
      console.error(
        "Error seeding tickets using API:",
        error.response ? error.response.data : error.message
      );
    }
  }
  console.log("All tickets seeded successfully!");
};
