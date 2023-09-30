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

    if (err.isOperational)
      return res
        .status(err.status)
        .json({ success: false, message: err.message });

    res.status(500).json({
      success: false,
      message: "An error occurred! Please try again later.",
    });
  });

  // Middleware to handle 404 errors for routes not found
  app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
  });

  // Middleware to handle response formatting for errors
  app.use((err, req, res, next) => {
    if (err instanceof Error)
      return res.status(err.status || 500).json({
        success: err.success || false,
        status: err.status || 500,
        message: err.message || "Something went wrong!",
      });
    next();
  });
};

export default errorHandlingMiddleware;
