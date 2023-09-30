// Importing required libraries and modules
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Importing middleware and error handling
import setupMiddlewares from "./middleware/index.js";
import errorHandlingMiddleware from "./middleware/errorhandling.js";
import loggingMiddleware from "./middleware/logging.js"; // Import the new logging middleware

// Importing controllers and routes
import { initializeRoles } from "./controllers/role.controller.js";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/user.js";
import roleRoute from "./routes/role.js";
import projectRoute from "./routes/project.js";
import teamRoute from "./routes/team.js";
import ticketRoute from "./routes/ticket.js";

// Initializing express app and configuring port
const app = express();
dotenv.config();
const PORT = process.env.PORT || 8800;

// Applying logging middleware to log each incoming client-side API request
loggingMiddleware(app);

// Setting up middlewares for handling CORS, parsing, etc.
setupMiddlewares(app);

// Setting up API routes
app.use("/api/role", roleRoute);
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/team", teamRoute);
app.use("/api/project", projectRoute);
app.use("/api/ticket", ticketRoute);

// Setting up the root endpoint for the API
app.get("/", (req, res) => {
  res.send("Welcome to the Auth API!");
});

// Check for the existence of required environment variables
const REQUIRED_ENV = ["MONGO_URL"];
REQUIRED_ENV.forEach((variable) => {
  if (!process.env[variable]) {
    console.error(`ERROR: ${variable} is not set. Terminating...`);
    process.exit(1);
  }
});

// Establishing a connection with the MongoDB database
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Database!");

    // Initializing roles after a successful database connection
    initializeRoles();
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Terminate the process with a failure code
  }
};

// Middleware to log each request
app.use((req, res, next) => {
  console.log(
    `Received a ${req.method} request on ${
      req.path
    } at ${new Date().toISOString()}`
  );
  next();
});

// Setup error handling middleware
errorHandlingMiddleware(app);

// Starting the express server and connecting to the MongoDB database
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
  connectMongoDB().catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
});
