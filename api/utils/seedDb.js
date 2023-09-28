import mongoose from "mongoose";
import dotenv from "dotenv";
import Role from "../models/Role.js";

dotenv.config(); // Load environment variables

// Connect to your MongoDB database
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB!");

    // Seed initial data
    Role.create({ name: "Admin" })
      .then(() => Role.create({ name: "User" }))
      .then(() => Role.create({ name: "Moderator" }))
      .then(() => {
        console.log("Database seeded!");
        process.exit(0);
      })
      .catch((err) => {
        console.error("Error seeding database: ", err);
        process.exit(1);
      });
  })
  .catch((err) => console.error("Could not connect to MongoDB: ", err));
