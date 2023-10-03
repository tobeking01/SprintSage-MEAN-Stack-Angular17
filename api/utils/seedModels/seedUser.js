import axios from "axios";

// const axios = require("axios");

const users = [
  {
    userName: "sus1",
    firstName: "sus1",
    lastName: "toy1",
    email: "sus1_toy@example.com",
    password: "student1",
    role: "Student",
  },
  {
    userName: "sus2",
    firstName: "sus2",
    lastName: "toy2",
    email: "sus2_toy@example.com",
    password: "student2",
    role: "Student",
  },
  {
    userName: "sus3",
    firstName: "sus3",
    lastName: "toy3",
    email: "sus3_toy@example.com",
    password: "student3",
    role: "Student",
  },
];

const baseURL = "http://localhost:8800/api/"; // replace with your API endpoint
const endpoint = "user/createUser"; // replace with your user creation endpoint

users.forEach(async (user) => {
  try {
    const response = await axios.post(`${baseURL}${endpoint}`, user);
    console.log(`User ${user.userName} created successfully`, response.data);
  } catch (error) {
    if (error.response) {
      console.error(
        `Error creating user ${user.userName}`,
        error.response.data
      );
    } else {
      console.error(`Error creating user ${user.userName}`, error.message);
    }
  }
});
