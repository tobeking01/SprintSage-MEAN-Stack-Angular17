// Importing mongoose and Schema from mongoose library.
// mongoose is an ODM library for MongoDB and Node.js
// Schema allows the definition of the shape of documents within a collection.
import mongoose, { Schema } from "mongoose";

// Defining a schema for the Token data model using mongoose.
// This model represents the structure of the data objects
// associated with user tokens, usually used for email verification,
// password resets, and similar functionalities.
const TokenSchema = mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
    index: true, // Added Index for optimized querying
  },
  type: {
    // Added type to differentiate the purpose of the token
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // For instance, increased to 10 minutes
  },
});

// Exporting the Token model.
// mongoose.model() is a function that takes in the model name and schema
// and returns a model. The model represents the token collection in the database,
// allowing interaction with this collection using the defined schema.
export default mongoose.model("Token", TokenSchema);
