import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Create a function to setup all the middlewares
const setupMiddlewares = (app) => {
  // Serving static files from the 'public' directory
  app.use("/static", express.static("public"));

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

  // Logging Middleware to log each request's method and path
  app.use((req, res, next) => {
    console.log(
      `Received a ${req.method} request on ${
        req.path
      } at ${new Date().toISOString()}`
    );
    next();
  });
};

export default setupMiddlewares;
