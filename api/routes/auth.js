import express from "express";

const router = express.Router();

// Add code between here

// End code added here.

// Utilities
// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

export default router;
