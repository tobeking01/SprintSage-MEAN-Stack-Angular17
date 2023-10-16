import mongoose from "mongoose";
import User from "../../models/User.js";
import Role from "../../models/Role.js";
import Team from "../../models/Team.js";
import dotenv from "dotenv";
dotenv.config();

async function seedUsers() {
  // Fetch the existing roles from the database
  const studentRole = await Role.findOne({ name: "Student" });
  const professorRole = await Role.findOne({ name: "Professor" });

  // Seed 8 Students
  const studentUsers = [];
  for (let i = 0; i < 8; i++) {
    const student = await User.create({
      firstName: `StudentFirst${i}`,
      lastName: `StudentLast${i}`,
      userName: `student_user_${i}`,
      email: `student${i}@mail.com`,
      password: "student_password",
      roles: [studentRole._id],
      schoolYear: `Year ${i + 1}`,
      expectedGraduation: new Date(2024, 5, 1),
    });
    studentUsers.push(student);
  }

  // Seed 2 Professors
  const professorUsers = [];
  for (let i = 0; i < 2; i++) {
    const professor = await User.create({
      firstName: `ProfFirst${i}`,
      lastName: `ProfLast${i}`,
      userName: `professor_user_${i}`,
      email: `professor${i}@mail.com`,
      password: "professor_password",
      roles: [professorRole._id],
      professorTitle: `Title ${i + 1}`,
      professorDepartment: `Department ${i + 1}`,
    });
    professorUsers.push(professor);
  }

  console.log("Users seeded!");
}

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB!");
    return seedUsers();
  })
  .then(() => {
    console.log("Seeding completed!");
    mongoose.disconnect();
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
  });
