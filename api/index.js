import express from "express";
import mongoose from "mongoose";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 8800;

//DB Connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Database!");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit the process with failure
  }
};

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
  connectMongoDB().catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
});
