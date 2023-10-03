// seedProjects.js

import axios from "axios";
import mongoose from "mongoose";

// Replace this with your API endpoint
const baseURL = "http://localhost:8800/api/";
const endpoint = "project/createProject"; // Replace with your project creation endpoint

// Teams you've provided
const teams = [
  "651b4e662a3cd62a2af17a50", // Team Alpha
  "651b4e662a3cd62a2af17a52", // Team Beta
  "651b4e662a3cd62a2af17a54", // Team Gamma
];

const projects = [
  {
    projectName: "Project A",
    description: "This is the description for Project A",
    teams: [teams[0]], // Only Team Alpha
    startDate: new Date(2023, 10, 3), // Nov 3, 2023
    endDate: new Date(2023, 12, 3), // Dec 3, 2023
  },
  {
    projectName: "Project B",
    description: "This is the description for Project B",
    teams: [teams[1]], // Only Team Beta
    startDate: new Date(2023, 10, 5), // Nov 5, 2023
    endDate: new Date(2023, 12, 5), // Dec 5, 2023
  },
  {
    projectName: "Project C",
    description: "This is the description for Project C",
    teams: [teams[2]], // Only Team Gamma
    startDate: new Date(2023, 10, 7), // Nov 7, 2023
    endDate: new Date(2023, 12, 7), // Dec 7, 2023
  },
];

projects.forEach(async (project) => {
  try {
    const response = await axios.post(`${baseURL}${endpoint}`, project);
    console.log(
      `Project ${project.projectName} created successfully`,
      response.data
    );
  } catch (error) {
    if (error.response) {
      console.error(
        `Error creating project ${project.projectName}`,
        error.response.data
      );
    } else {
      console.error(
        `Error creating project ${project.projectName}`,
        error.message
      );
    }
  }
});
