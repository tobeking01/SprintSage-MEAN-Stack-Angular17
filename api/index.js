import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

const app = express();
dotenv.config();

//DB Connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Database!");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit the process with failure
  }
};

app.listen(8800, () => {
  console.log(`Server started on http://localhost:${8800}`);
  connectMongoDB().catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
});
