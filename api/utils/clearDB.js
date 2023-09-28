import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Connect to your MongoDB database
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB!");

    // Drop the Database
    mongoose.connection.db
      .dropDatabase()
      .then(() => {
        console.log("Database cleared!");
        process.exit(0);
      })
      .catch((err) => {
        console.error("Error clearing database: ", err);
        process.exit(1);
      });
  })
  .catch((err) => console.error("Could not connect to MongoDB: ", err));
