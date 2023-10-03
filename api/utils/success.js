/**
 * Utility function to create a success response.
 * @param {number} statusCode - HTTP status code.
 * @param {string} message - Descriptive message indicating the result of the operation.
 * @param {Object} [data=null] - Data to be returned in the response.
 * @returns {Object} Response object.
 */
export const CreateSuccess = (statusCode, message, data = null) => {
  return {
    success: statusCode >= 200 && statusCode < 300, // Success is based on the HTTP status code range
    status: statusCode,
    message: message,
    data: data,
  };
};
