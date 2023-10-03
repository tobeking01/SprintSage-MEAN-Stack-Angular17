import mongoose from "mongoose";
import { seedProjects } from "./seedProject.js";
import { seedTeams } from "./seedTeam.js";
import { seedTickets } from "./seedTicket.js";
import { seedUsers } from "./seedUser.js";
import dotenv from "dotenv";

dotenv.config();
const MONGO_URI = process.env.MONGO_URL;

async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    await seedProjects();
    await seedTeams();
    await seedTickets();
    await seedUsers();

    console.log("Database seeded successfully!");

    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding the database:", error);
  }
}

seedDB();
