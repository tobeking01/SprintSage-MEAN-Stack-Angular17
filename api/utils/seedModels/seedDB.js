import axios from "axios";
import { seedProject } from "./seedProject.js";
import { seedTeam } from "./seedTeam.js";
import { seedTicket } from "./seedTicket.js";
import { seedUser } from "./seedUser.js";

const fullURL = "http://localhost:27017/AuthDB";

async function seedDB() {
  try {
    // Call the functions or execute code from the imported scripts
    await seedProject();
    await seedTeam();
    await seedTicket();
    await seedUser();

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding the database:", error);
  }
}

// Call the seedDB function to start the seeding process
seedDB();

// You can now use Axios for making HTTP requests like so:
axios.get(fullURL).then((response) => {
  console.log("Response from Axios:", response.data);
});
