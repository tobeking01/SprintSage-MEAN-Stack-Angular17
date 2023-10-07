import { sendError } from "../utils/createResponse.js";

// Error Handling Middleware to handle all errors
const errorHandlingMiddleware = (app) => {
  // Middleware to log errors and send response to client
  app.use((err, req, res, next) => {
    console.error(
      `Error occurred at ${new Date().toISOString()} during handling a request on ${
        req.path
      }:`,
      err
    );

    // If the error is operational (meaning it was expected, like validation errors),
    // send the error message with the appropriate status code
    if (err.isOperational) {
      return sendError(res, err.status, err.message);
    }

    // If it's an unexpected error (not operational), send a generic message
    sendError(res, 500, "An error occurred! Please try again later.");
  });

  // Middleware to handle 404 errors for routes not found
  app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    // Pass the error to the next middleware
    next(err);
  });

  // Middleware to handle response formatting for errors
  app.use((err, req, res, next) => {
    // If the error object is an instance of the Error class (which includes operational errors,
    // 404 errors, and other exceptions), send the error using our utility
    if (err instanceof Error) {
      return sendError(
        res,
        err.status || 500,
        err.message || "Something went wrong!"
      );
    }
    next();
  });
};

export default errorHandlingMiddleware;
