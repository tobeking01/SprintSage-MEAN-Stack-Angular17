import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { initializeRoles } from "./controllers/role.controller.js";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/user.js";
import roleRoute from "./routes/role.js";
import projectRoute from "./routes/project.js";
import teamRoute from "./routes/team.js";
import ticketRoute from "./routes/ticket.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 8800;

// Serving static files from the 'public' directory
app.use("/static", express.static("public"));

// Setting up the root endpoint for the API
app.get("/", (req, res) => {
  res.send("Welcome to the Auth API!");
});

// Middleware for JSON body parsing
app.use(express.json());

// Middleware to parse cookies from incoming requests
app.use(cookieParser());

// Middleware for enabling CORS with specific origin and credentials options
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  })
);

// Setting up API routes for various functionalities
app.use("/api/role", roleRoute);
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/team", teamRoute);
app.use("/api/project", projectRoute);
app.use("/api/ticket", ticketRoute);

app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware to handle 404 errors for routes not found
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  err.success = false;
  next(err);
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
    // Call the initializeRoles function here, after a successful database connection
    initializeRoles();
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit the process with failure
  }
};

// Middleware to handle response formatting for errors
app.use((err, req, res, next) => {
  if (err instanceof Error) {
    const isSuccess = err.success || false;
    const statusCode = err.status || 500;
    const errorMessage = err.message || "Something went wrong!";

    res.status(statusCode).json({
      success: isSuccess,
      status: statusCode,
      message: errorMessage,
      data: err.data,
    });
  } else {
    next();
  }
});

// Starting the express server and connecting to the MongoDB database
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
  connectMongoDB().catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
});
