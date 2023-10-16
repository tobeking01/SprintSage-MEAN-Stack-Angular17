import mongoose from "mongoose";
import Team from "../../models/Team.js";
import Project from "../../models/Project.js";
import Ticket from "../../models/Ticket.js"; // Import the Ticket model
import dotenv from "dotenv";
dotenv.config();

async function seedProjects() {
  // Fetch all the teams from the database
  const teams = await Team.find();

  for (const team of teams) {
    // Create a project for each team
    const project = await Project.create({
      projectName: `ProjectFor${team.teamName}`,
      teamMembers: team.teamMembers,
      teams: [team._id], // Here, we're setting the team for the project
      description: `Description for Project of ${team.teamName}`,
      startDate: new Date(),
      endDate: new Date(2024, 12, 31), // You can adjust this date as needed
      tickets: [], // Initialize an empty array for tickets
    });

    // Create and associate tickets with the project
    for (let i = 1; i <= 3; i++) {
      const ticket = await Ticket.create({
        issueDescription: `Ticket ${i} for ${team.teamName}`,
        status: "Open", // Set the initial status
        severity: "Low", // Set the initial severity
        submittedByUser: team.teamMembers[0], // Assuming the first team member is the submitter
        assignedToUser: null, // You can assign a user here if needed
        projectId: project._id, // Associate the ticket with the project
        ticketType: "Bug", // Set the ticket type
        state: "New", // Set the initial state
      });

      // Add the created ticket to the project's tickets array
      project.tickets.push(ticket);
    }

    // Save the project with associated tickets
    await project.save();
  }

  console.log("Projects seeded!");
}

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB!");
    return seedProjects();
  })
  .then(() => {
    console.log("Seeding completed!");
    mongoose.disconnect();
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
  });
