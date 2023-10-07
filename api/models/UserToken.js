// Import the mongoose library and its Schema constructor function.
// Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js.
// The Schema constructor function allows us to define the structure of documents in a MongoDB collection.
import mongoose, { Schema } from "mongoose";

/**
 * Token Schema Definition
 *
 * Represents the blueprint for a token associated with a user in the system.
 * Tokens can serve various purposes, such as email verification, password resets,
 * and more. This schema defines how token-related data should be structured in the database.
 */
const TokenSchema = mongoose.Schema({
  // Reference to the User to whom the token belongs
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // This establishes a relationship with the User model
  },
  // The actual token string
  token: {
    type: String,
    required: true,
    index: true, // Optimizes the querying by the token value
  },
  // Indicates the type or purpose of the token (e.g., "email-verification" or "password-reset")
  type: {
    type: String,
    required: true,
  },
  // The creation date of the token, which also determines its expiration time
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Token expires after 10 minutes (600 seconds)
  },
});

/**
 * Token Model Definition
 *
 * Using the defined TokenSchema, this model provides a way to perform database operations
 * related to tokens. Actions such as generating a new token, verifying a token, or deleting
 * an expired token can be done using this model.
 *
 * Note: In MongoDB, the collection will be named 'tokens' due to mongoose's pluralization behavior.
 */
export default mongoose.model("Token", TokenSchema);
