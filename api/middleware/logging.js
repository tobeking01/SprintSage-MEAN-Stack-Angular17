// Middleware to log each incoming client-side API request

const loggingMiddleware = (app) => {
  app.use((req, res, next) => {
    console.log(`\n--- New Request ---`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Method: ${req.method}`);
    console.log(`Path: ${req.path}`);
    console.log(
      `Full URL: ${req.protocol}://${req.get("host")}${req.originalUrl}`
    );
    console.log(`IP Address: ${req.ip}`);
    console.log(`Query Parameters: ${JSON.stringify(req.query)}`);
    console.log(`Headers: ${JSON.stringify(req.headers)}`);
    if (req.body && Object.keys(req.body).length)
      console.log(`Body: ${JSON.stringify(req.body)}`);
    next();
  });
};

export default loggingMiddleware;

// const loggingMiddleware = (app) => {
//   app.use((req, res, next) => {
//     console.log(`\n--- New Request ---`);
//     console.log(`Timestamp: ${new Date().toISOString()}`);
//     console.log(`Method: ${req.method}`);
//     console.log(`Path: ${req.path}`);
//     console.log(`Query Parameters: ${JSON.stringify(req.query)}`);
//     if (req.body && Object.keys(req.body).length)
//       console.log(`Body: ${JSON.stringify(req.body)}`);
//     next();
//   });
// };

// export default loggingMiddleware;
