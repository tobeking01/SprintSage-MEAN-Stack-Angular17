// Success Message Utility
export const CreateSuccess = (statusCode, successMessage, data) => {
  return {
    success: true,
    status: statusCode,
    message: successMessage,
    data: data,
  };
};
