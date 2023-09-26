// Importing mongoose and Schema from mongoose library.
// mongoose is an ODM library for MongoDB and Node.js
// Schema allows the definition of the shape of documents within a collection.
import mongoose, { Schema } from "mongoose";

// Defining a schema for the Token data model using mongoose.
// This model represents the structure of the data objects
// associated with user tokens, usually used for email verification,
// password resets, and similar functionalities.
const TokenSchema = mongoose.Schema({
  // `userId` field stores a reference to the corresponding user object
  // It's of ObjectId type which is used to create references to other documents.
  // 'ref' is used to associate the ObjectId with User model.
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },

  // `token` field stores the actual token string.
  // This token is used for authentication or other user-related tasks.
  token: {
    type: String,
    required: true,
  },

  // `createdAt` field stores the date at which the token is created.
  // It has a default value of the current date and time at the moment of token creation.
  // `expires` sets the expiry time for the token to 300 seconds (5 minutes) after creation.
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Token expiration time in seconds
  },
});

// Exporting the Token model.
// mongoose.model() is a function that takes in the model name and schema
// and returns a model. The model represents the token collection in the database,
// allowing interaction with this collection using the defined schema.
export default mongoose.model("Token", TokenSchema);
