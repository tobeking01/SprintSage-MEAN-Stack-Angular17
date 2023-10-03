import mongoose from "mongoose";

// Define the User schema
const UserSchema = new mongoose.Schema({
  userName: String,
  firstName: String,
  lastName: String,
  email: String,
  password: String, // Note: Ideally, you should never save passwords in plain text. Always hash them.
  role: String,
});

// Create a mongoose model for users
const User = mongoose.model("User", UserSchema);

const usersData = [
  {
    userName: "sus1",
    firstName: "sus1",
    lastName: "toy1",
    email: "sus1_toy@example.com",
    password: "student1", // This should be hashed in a real application
    role: "Student",
  },
  {
    userName: "sus2",
    firstName: "sus2",
    lastName: "toy2",
    email: "sus2_toy@example.com",
    password: "student2", // This should be hashed in a real application
    role: "Student",
  },
  {
    userName: "sus3",
    firstName: "sus3",
    lastName: "toy3",
    email: "sus3_toy@example.com",
    password: "student3", // This should be hashed in a real application
    role: "Student",
  },
  {
    userName: "prof1",
    firstName: "prof1",
    lastName: "rof1",
    email: "prof1_rof@example.com",
    password: "professor1", // This should be hashed in a real application
    role: "Professor",
  },
  {
    userName: "prof2",
    firstName: "prof2",
    lastName: "rof2",
    email: "prof2_rof@example.com",
    password: "Professor2", // This should be hashed in a real application
    role: "Professor",
  },
];

export const seedUsers = async () => {
  try {
    await User.insertMany(usersData);
    console.log("Users seeded successfully!");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};
