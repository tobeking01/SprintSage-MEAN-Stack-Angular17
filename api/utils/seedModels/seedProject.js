import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  projectName: String,
  description: String,
  teams: [String], // array of teamIds
  startDate: Date,
  endDate: Date,
});

const Project = mongoose.model("Project", ProjectSchema);

const teams = [
  "651b4e662a3cd62a2af17a50", // Team Alpha
  "651b4e662a3cd62a2af17a52", // Team Beta
  "651b4e662a3cd62a2af17a54", // Team Gamma
];

const projectsData = [
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

export const seedProjects = async () => {
  try {
    await Project.insertMany(projectsData);
    console.log("Projects seeded successfully!");
  } catch (error) {
    console.error("Error seeding projects:", error);
  }
};
