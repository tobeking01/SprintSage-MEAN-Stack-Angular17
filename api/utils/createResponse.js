// Importing utility functions for creating error and success responses.
import { createError } from "./createError.js";
import { createSuccess } from "./createSuccess.js";

// Function to send an error response.
export const sendError = (res, status, message, data = null) => {
  if (!res) {
    console.error(`Error: ${message}`);
    return;
  }

  const error = createError(status, message, data);
  const errorResponse = {
    success: false,
    status: error.status,
    message: error.message,
    data: error.data,
  };

  res.status(status).json(errorResponse);
};

// Function to send a success response.
export const sendSuccess = (res, statusCode, message, data, cookie = null) => {
  if (!res) {
    console.error(
      `Error: Unable to send success response. Response object is undefined.`
    );
    return;
  }

  const successResponse = createSuccess(statusCode, message, data);

  if (cookie && typeof cookie === "object") {
    res.cookie(cookie.name, cookie.value, cookie.options);
  }

  res.status(statusCode).json(successResponse);
};
