import mongoose from "mongoose";
import dotenv from "dotenv";
import seedUsers from "./seedUser.js";
import seedTeams from "./seedTeam.js";
import seedProjects from "./seedProject.js";
import seedTickets from "./seedTicket.js";

dotenv.config();

async function seedAll() {
  let isConnected = false;

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("Connected to MongoDB!");

    // Seed Users
    await seedUsers();
    console.log("Users seeded!");

    // Seed Teams
    await seedTeams();
    console.log("Teams seeded!");

    // Seed Projects
    await seedProjects();
    console.log("Projects seeded!");

    // Seed Tickets
    await seedTickets();
    console.log("Tickets seeded!");

    console.log("Seeding completed!");
  } catch (error) {
    console.error("Error during seeding:", error);

    // Depending on your requirements, handle errors and potentially rollback data here
    // Be cautious with data rollback in MongoDB, as it's not as straightforward as in relational databases
  } finally {
    // Disconnect from MongoDB
    if (isConnected) {
      mongoose.disconnect();
      console.log("Disconnected from MongoDB.");
    }
  }
}

// Execute the seedAll function
seedAll();
