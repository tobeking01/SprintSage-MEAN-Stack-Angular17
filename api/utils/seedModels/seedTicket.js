import mongoose from "mongoose";
import Ticket from "../../models/Ticket.js";
import User from "../../models/User.js"; // Import User model if not already imported

import dotenv from "dotenv";
dotenv.config();

async function seedTickets() {
  // Replace these with valid user and project IDs from your database
  const submittedByUserId = "651db23060ddea1a28c14c53"; // Replace with a valid user ID
  const projectId = "651db4d235bb80ee0479fba3"; // Replace with a valid project ID

  // Create tickets for the specified project
  for (let i = 0; i < 3; i++) {
    // Create the ticket
    const ticket = new Ticket({
      issueDescription: `Issue Description for Ticket ${i + 1} of ${projectId}`,
      status: "Open", // You can set the status as needed
      severity: "Medium", // You can set the severity as needed
      submittedByUser: submittedByUserId,
      projectId: projectId,
      ticketType: "Bug", // You can set the ticket type as needed
      state: "New", // You can set the initial state as needed
    });

    try {
      await ticket.save();
      console.log(`Ticket ${i + 1} seeded for Project ${projectId}`);
    } catch (error) {
      console.error(`Error seeding ticket: ${error}`);
    }
  }

  console.log("Tickets seeded!");
}

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB!");
    return seedTickets();
  })
  .then(() => {
    console.log("Seeding completed!");
    mongoose.disconnect();
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
  });
