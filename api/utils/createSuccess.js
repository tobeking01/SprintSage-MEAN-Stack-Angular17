/**
 * Utility function to create a success response.
 * @param {number} statusCode - HTTP status code.
 * @param {string} message - Descriptive message indicating the result of the operation.
 * @param {Object} [data=null] - Data to be returned in the response.
 * @returns {Object} Response object.
 */
export const createSuccess = (statusCode, message, data = []) => {
  return {
    success: statusCode >= 200 && statusCode < 300, // Check if status code indicates success
    status: statusCode,
    message: message,
    data: data,
  };
};
