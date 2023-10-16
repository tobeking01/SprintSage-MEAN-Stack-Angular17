// Importing necessary modules
import mongoose from "mongoose";
import User from "./user.model.js";
import Role from "./role.model.js";
import Project from "./project.model.js";
import Ticket from "./ticket.model.js";
import Team from "./team.model.js";

// Setting the default Promise library to be used by Mongoose
mongoose.Promise = global.Promise;

// Creating a database object that includes mongoose (the MongoDB connection), User model, Role model, and a list of roles
const db = {
  mongoose, // The Mongoose instance for connecting to MongoDB
  User, // The User model for working with the 'users' collection
  Role, // The Role model for working with the 'roles' collection
  Project, // The Project model for working with the 'projects' collection
  Ticket, // The Ticket model for working with the 'tickets' collection
  Team, // The Team model for working with the 'teams' collection
  ROLES: ["Student", "Professor", "Admin"], // An array of role names
};

// Exporting the 'db' object so it can be used in other parts of your application
export default db;
