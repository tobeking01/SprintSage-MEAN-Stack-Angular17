// Error Message utility
export const CreateError = (status, message) => {
  const err = new Error();
  err.success = false;
  err.status = status;
  err.message = message;
  return err;
};
