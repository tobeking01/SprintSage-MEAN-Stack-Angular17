// db.js
import mongoose from "mongoose";
import User from "./user.model.js";
import Role from "./role.model.js";

mongoose.Promise = global.Promise;

const db = {
  mongoose,
  User,
  Role,
  ROLES: ["User", "Moderator", "Admin"],
};

export default db;
