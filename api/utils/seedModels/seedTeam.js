// seedTeams.js

import axios from "axios";
import mongoose from "mongoose";

// Replace this with your API endpoint
const baseURL = "http://localhost:8800/api/";
const endpoint = "team/createTeam"; // Replace with your team creation endpoint

// Users you've provided
const users = [
  "651b4c8dbeabf075e72bbc57",
  "651b4c8dbeabf075e72bbc59",
  "651b4c8dbeabf075e72bbc5b",
];

const teams = [
  {
    teamName: "Team Alpha",
    teamMembers: [users[0], users[1]], // sus1 and sus2
  },
  {
    teamName: "Team Beta",
    teamMembers: [users[1], users[2]], // sus2 and sus3
  },
  {
    teamName: "Team Gamma",
    teamMembers: [users[0], users[2]], // sus1 and sus3
  },
];

teams.forEach(async (team) => {
  try {
    const response = await axios.post(`${baseURL}${endpoint}`, team);
    console.log(`Team ${team.teamName} created successfully`, response.data);
  } catch (error) {
    if (error.response) {
      console.error(
        `Error creating team ${team.teamName}`,
        error.response.data
      );
    } else {
      console.error(`Error creating team ${team.teamName}`, error.message);
    }
  }
});
