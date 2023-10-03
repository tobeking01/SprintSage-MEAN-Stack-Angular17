/**
 * Utility function to create a custom error object.
 * @param {number} status - HTTP status code.
 * @param {string} message - Error message describing the nature of the error.
 * @returns {Error} Custom error object with status property.
 */
export const CreateError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};
