import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
  teamName: String,
  teamMembers: [String], // assuming this is an array of userIds
});

const Team = mongoose.model("Team", TeamSchema);

const users = [
  "651b4c8dbeabf075e72bbc57",
  "651b4c8dbeabf075e72bbc59",
  "651b4c8dbeabf075e72bbc5b",
];

const teamsData = [
  {
    teamName: "Team Alpha",
    teamMembers: [users[0], users[1]],
  },
  {
    teamName: "Team Beta",
    teamMembers: [users[1], users[2]],
  },
  {
    teamName: "Team Gamma",
    teamMembers: [users[0], users[2]],
  },
];

export const seedTeams = async () => {
  try {
    await Team.insertMany(teamsData);
    console.log("Teams seeded successfully!");
  } catch (error) {
    console.error("Error seeding teams:", error);
  }
};
