import mongoose from "mongoose";
import User from "../../models/User.js";
import Team from "../../models/Team.js";
import dotenv from "dotenv";
dotenv.config();

async function seedTeams() {
  // Fetch all the students and professors from the database
  const students = await User.find({ roles: "651e0c343da4dec2b02605ff" });
  const professors = await User.find({ roles: "651e0c343da4dec2b0260604" });

  // Get the professors' IDs
  const professorIDs = professors.map((prof) => prof._id);

  // We want to create teams of 2 students, so the number of teams is half the student count.
  for (let i = 0; i < students.length; i += 2) {
    // For every iteration, pick two students
    const teamMembers = [students[i]._id, students[i + 1]._id, ...professorIDs];

    console.log("Creating team with members:", teamMembers);

    // Create the team without saving it to the database yet
    const newTeam = new Team({
      teamName: `Team${i / 2}`,
      teamMembers: teamMembers,
    });

    // Save the team to the database
    await newTeam.save();
  }

  console.log("Teams seeded!");
}

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB!");
    return seedTeams();
  })
  .then(() => {
    console.log("Seeding completed!");
    mongoose.disconnect();
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
  });
