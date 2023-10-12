/**
 * Middleware to log every incoming request with its details, and then logs the response's status.
 * This is especially useful for debugging, monitoring, and getting insights on the nature of the traffic
 * the API is receiving.
 *
 * @param {Object} app - The Express application instance.
 */
const logRequestMiddleware = (app) => {
  app.use((req, res, next) => {
    // Capture the start time for calculating request duration later
    const startTimestamp = Date.now();

    // Log basic details about the incoming request
    console.log(`--- New Request ---`);
    console.log(`Timestamp: ${new Date(startTimestamp).toISOString()}`);
    console.log(`Method: ${req.method}`);
    console.log(`Path: ${req.path}`);
    console.log(
      `Full URL: ${req.protocol}://${req.get("host")}${req.originalUrl}`
    );
    console.log(`IP Address: ${req.ip}`);

    if (req.query && Object.keys(req.query).length)
      console.log(`Query Parameters: ${JSON.stringify(req.query)}`);
    if (req.headers && Object.keys(req.headers).length)
      console.log(`Headers: ${JSON.stringify(req.headers)}`);
    if (req.body && Object.keys(req.body).length)
      console.log(`Body: ${JSON.stringify(req.body)}`);

    res.on("finish", () => {
      logResponseDetails(res, req, startTimestamp);
    });

    next();
  });
};

const logResponseDetails = (res, req, startTimestamp) => {
  // Calculate the duration it took to process the request
  const duration = Date.now() - startTimestamp;

  // Determine if the response indicates an error (any status code >= 400)
  const isErrorResponse = res.statusCode >= 400;

  console.log(`--- Response Sent ---`);
  console.log(`Duration: ${duration}ms`);
  console.log(`Status Code: ${res.statusCode}`);

  if (isErrorResponse) {
    console.error(`Error occurred on ${req.method} ${req.path}`);
  } else {
    console.log(`Success on ${req.method} ${req.path}`);
  }
};

export default logRequestMiddleware;
