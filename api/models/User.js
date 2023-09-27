// user.model.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
