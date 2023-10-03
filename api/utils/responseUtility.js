// Importing utility functions for creating error and success responses.
import { CreateError } from "./error.js";
import { CreateSuccess } from "./success.js";

// Function to send an error response.
// Takes the response object, status code, and message as parameters.
export const sendError = (res, status, message) => {
  // Generate the error response using the CreateError utility function.
  const errorResponse = CreateError(status, message);

  // Send the error response with the specified status code.
  res.status(status).json(errorResponse);
};

// Function to send a success response.
// Takes the response object, status code, message, data (optional),
// and a cookie object (optional) as parameters.
export const sendSuccess = (res, statusCode, message, data, cookie = null) => {
  // Generate the success response using the CreateSuccess utility function.
  const successResponse = CreateSuccess(statusCode, message, data);

  // If a cookie object is provided, set it in the response.
  if (cookie) {
    res.cookie(cookie.name, cookie.value, cookie.options);
  }

  // Send the success response with the specified status code.
  res.status(statusCode).json(successResponse);
};
