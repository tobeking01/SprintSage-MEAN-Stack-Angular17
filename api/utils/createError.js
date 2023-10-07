/**
 * Utility function to create a custom error object.
 * @param {number} status - HTTP status code.
 * @param {string} message - Error message describing the nature of the error.
 * @param {Object} [data=null] - Additional data related to the error.
 * @returns {Error} Custom error object with status and data properties.
 */
export const createError = (status, message, data = null) => {
  const err = new Error(message);
  err.status = status;
  err.data = data;
  return err;
};
