import { v4 as uuidv4 } from "uuid";

/**
 * Middleware to log every incoming request with its details, and then logs the response's status.
 * This is especially useful for debugging, monitoring, and getting insights on the nature of the traffic
 * the API is receiving.
 *
 * @param {Object} app - The Express application instance.
 */
const logRequestMiddleware = (app) => {
  app.use((req, res, next) => {
    // Generate a unique UUID for the current request
    const requestId = uuidv4();
    req.requestId = requestId; // Attach the requestId to the request object
    // Capture the start time for calculating request duration later
    const startTimestamp = Date.now();

    // Log entry with requestId
    console.log(`--- New Request [${requestId}] ---`);
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
      logResponseDetails(res, req, startTimestamp, requestId);
    });

    next();
  });
};

const logResponseDetails = (res, req, startTimestamp, requestId) => {
  const duration = Date.now() - startTimestamp;
  const isErrorResponse = res.statusCode >= 400;

  // Include requestId in response log
  console.log(`--- Response Sent [${requestId}] ---`);
  console.log(`Duration: ${duration}ms`);
  console.log(`Status Code: ${res.statusCode}`);

  if (isErrorResponse) {
    console.error(`Error occurred on ${req.method} ${req.path}`);
  } else {
    console.log(`Success on ${req.method} ${req.path}`);
  }
};

export default logRequestMiddleware;
