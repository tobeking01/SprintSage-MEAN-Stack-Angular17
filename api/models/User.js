// Importing mongoose for working with MongoDB.
// Also importing the 'Schema' class from mongoose for schema validation.
import mongoose, { Schema } from "mongoose";

// Defining a schema for the User data model using mongoose.
const UserSchema = mongoose.Schema(
  {
    // Field to store the first name of the user. It's mandatory.
    firstName: {
      type: String, // Specifies that the datatype should be a string.
      required: true, // This field must be provided when creating a new user.
    },

    // Field to store the last name of the user. It's mandatory.
    lastName: {
      type: String,
      required: true,
    },

    // Field to store the user's unique username. It's mandatory and must be unique.
    userName: {
      type: String,
      required: true,
      unique: true, // Ensures that the username value is unique across all users.
    },

    // Field to store the user's email. It's mandatory and must be unique.
    email: {
      type: String,
      required: true,
      unique: true, // Ensures that the email value is unique across all users.
    },

    // Field to store the user's password. It's mandatory.
    password: {
      type: String,
      required: true,
    },

    // Boolean field to determine if the user is an admin.
    isAdmin: {
      type: Boolean,
      default: false, // Default is 'false', meaning the user isn't an admin by default.
    },

    // Array to store references to roles that are associated with the user.
    roles: {
      type: [Schema.Types.ObjectId], // An array of ObjectIds (references to other documents).
      required: true,
      ref: "Role", // Specifies that the ObjectIds refer to documents in the "Role" collection.
    },
  },
  {
    // Option to automatically create 'createdAt' and 'updatedAt' timestamps for each user entry.
    timestamps: true,
  }
);

// Exporting the User model.
// It creates a 'User' collection in the database using the defined schema.
export default mongoose.model("User", UserSchema);
