// Middleware to log each incoming client-side API request

/**
 * Middleware to log every incoming request with its details, and then logs the response's status.
 * This is especially useful for debugging, monitoring, and getting insights on the nature of the traffic
 * the API is receiving.
 *
 * @param {Object} app - The Express application instance.
 */
const logRequestMiddleware = (app) => {
  // Use the middleware for every request to the app
  app.use((req, res, next) => {
    // Capture the start time for calculating request duration later
    const startTimestamp = Date.now();

    // Log basic details about the incoming request
    console.log(`\n--- New Request ---`);
    console.log(`Timestamp: ${new Date(startTimestamp).toISOString()}`);
    console.log(`Method: ${req.method}`);
    console.log(`Path: ${req.path}`);
    console.log(
      `Full URL: ${req.protocol}://${req.get("host")}${req.originalUrl}`
    );
    console.log(`IP Address: ${req.ip}`);
    console.log(`Query Parameters: ${JSON.stringify(req.query)}`);
    console.log(`Headers: ${JSON.stringify(req.headers)}`);
    if (req.body && Object.keys(req.body).length)
      // Only log the body if it's not empty
      console.log(`Body: ${JSON.stringify(req.body)}`);

    // After the response is sent to the client, log details about the response
    res.on("finish", () => {
      // Calculate the duration it took to process the request
      const duration = Date.now() - startTimestamp;

      // Determine if the response indicates an error (any status code >= 400)
      const isErrorResponse = res.statusCode >= 400;

      console.log(`--- Response Sent ---`);
      console.log(`Duration: ${duration}ms`);
      console.log(`Status Code: ${res.statusCode}`);

      // If there was an error, it's beneficial to explicitly log that an error occurred
      if (isErrorResponse) {
        console.error(`Error occurred on ${req.method} ${req.path}`);
      } else {
        console.log(`Success on ${req.method} ${req.path}`);
      }
    });

    // Call the next middleware or route handler
    next();
  });
};

export default logRequestMiddleware;
