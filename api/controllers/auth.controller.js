// Import necessary libraries, models, and utility functions for user authentication and error handling.
import Role from "../models/Role.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs"; // Used for password hashing.
import jwt from "jsonwebtoken"; // Used for token creation.
import nodemailer from "nodemailer"; // Used for sending email.
import { CreateError } from "../utils/error.js"; // Custom utility function for handling errors.
import { CreateSuccess } from "../utils/success.js"; // Custom utility function for handling success messages.
import UserToken from "../models/UserToken.js";

// `register` function handles the process of registering a new user.
export const register = async (req, res, next) => {
  try {
    // Extract user details from the request body.
    const { firstName, lastName, userName, email, password } = req.body;

    // Ensure all required fields are provided.
    if (!firstName || !lastName || !userName || !email || !password) {
      return res.status(400).json(CreateError(400, "All fields are required."));
    }

    // Fetch the role "User" from the Role model in the database.
    // This step ensures the role exists before associating it with the user.
    const role = await Role.findOne({ name: "User" });
    if (!role) {
      return res.status(400).json(CreateError(400, "User role not found."));
    }

    // Check if a user with the same email or username already exists in the database.
    const userExists = await User.findOne({
      $or: [{ email }, { userName }],
    });
    if (userExists) {
      return res
        .status(409)
        .json(CreateError(409, "Email or Username already exists."));
    }

    // Generate a salt using bcrypt. This will be used to hash the password.
    const salt = await bcrypt.genSalt(10);
    // Hash the user's password using the generated salt.
    const hashPassword = await bcrypt.hash(password, salt);

    // Create a new user instance with the provided details and the hashed password.
    const newUser = new User({
      firstName,
      lastName,
      userName,
      email,
      password: hashPassword,
      roles: [role._id], // Added role ID here
    });
    // Save the user instance to the database.
    await newUser.save();

    // Send a success response indicating the user was registered.
    res.status(200).json(CreateSuccess(200, "User Registration Successfully!"));
  } catch (error) {
    // If any errors occur, log them and send an error response.
    console.error("Error registering user:", error);
    next(CreateError(500, "Error registering user!"));
  }
};

// `login` function handles the user authentication process.
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(CreateError(400, "Email and password are required."));
    }

    // Fetch the user associated with the provided email. Also, populate the associated roles.
    const user = await User.findOne({ email }).populate("roles");

    // If no user is found with the provided email, return an error.
    if (!user) {
      return res
        .status(404)
        .json(CreateError(404, "User with the given email not found."));
    }

    // Compare the provided password with the stored hashed password using bcrypt.
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json(CreateError(401, "Incorrect password."));
    }

    // If authentication is successful, generate a JWT token for the user.
    const token = jwt.sign(
      {
        id: user._id,
        roles: user.roles.map((role) => role.name),
      },
      process.env.JWT_SECRET // Use the secret key from environment variables.
    );

    // Send the generated JWT token as a cookie in the response.
    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json({
        status: 200,
        message: "Login Success",
        data: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          roles: user.roles.map((role) => role.name),
        },
      });
  } catch (error) {
    // Log and return any errors that occur during the login process.
    console.error("Error during login:", error);
    next(CreateError(500, "Internal Server Error."));
  }
};

// `registerModerator` function is for registering moderator users specifically.
export const registerModerator = async (req, res, next) => {
  try {
    const { firstName, lastName, userName, email, password } = req.body;

    if (!firstName || !lastName || !userName || !email || !password) {
      return res.status(400).json(CreateError(400, "All fields are required."));
    }

    // Generate a salt using bcrypt. This will be used to hash the password.
    const salt = await bcrypt.genSalt(10);
    // Hash the user's password using the generated salt.
    const hashPassword = await bcrypt.hash(password, salt);

    // Fetch the moderator role.
    const moderatorRole = await Role.findOne({ name: "Moderator" });
    if (!moderatorRole)
      return next(CreateError(400, "Moderator role not found."));

    const userExists = await User.findOne({ $or: [{ email }, { userName }] });
    if (userExists)
      return res
        .status(409)
        .json(CreateError(409, "Email or Username already exists."));

    const newModeratorUser = new User({
      firstName,
      lastName,
      userName,
      email,
      password: hashPassword,
      roles: [moderatorRole._id], // Assign only the moderator role
    });
    await newModeratorUser.save();

    res
      .status(200)
      .json(CreateSuccess(200, "Moderator Registration Successfully!"));
  } catch (error) {
    console.error("Error registering Moderator:", error);
    next(CreateError(500, "Error registering Moderator!"));
  }
};

// `registerAdmin` function is similar to the `register` function but is specifically for registering admin users.
export const registerAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, userName, email, password } = req.body;

    if (!firstName || !lastName || !userName || !email || !password) {
      return res.status(400).json(CreateError(400, "All fields are required."));
    }

    // Generate a salt using bcrypt. This will be used to hash the password.
    const salt = await bcrypt.genSalt(10);
    // Hash the user's password using the generated salt.
    const hashPassword = await bcrypt.hash(password, salt);

    // Fetch all roles for the admin user. In this context, admins have all roles.
    const adminRole = await Role.findOne({ name: "Admin" });
    if (!adminRole) return next(CreateError(400, "Admin role not found."));

    const userExists = await User.findOne({ $or: [{ email }, { userName }] });
    if (userExists)
      return res
        .status(409)
        .json(CreateError(409, "Email or Username already exists."));

    const newAdminUser = new User({
      firstName,
      lastName,
      userName,
      email,
      password: hashPassword,
      roles: [adminRole._id], // Assign only the admin role
    });
    await newAdminUser.save();

    res
      .status(200)
      .json(CreateSuccess(200, "Admin Registration Successfully!"));
  } catch (error) {
    console.error("Error registering Admin:", error);
    next(CreateError(500, "Error registering Admin!"));
  }
};

// This controller handles the logic for sending password reset emails.
export const sendEmail = async (req, res) => {
  try {
    // Extract the email from the incoming request.
    const email = req.body.email;

    // Query the database to find a user with the provided email.
    // Note: This search is case insensitive.
    const user = await User.findOne({
      email: new RegExp(`^${email}$`, "i"),
    });

    // If the user does not exist, return a 400 error.
    if (!user) {
      return res
        .status(400)
        .json(CreateError(400, "User not found to reset the email"));
    }

    // Prepare a payload for JWT. This will be used to verify the token later.
    const payload = {
      email: user.email,
    };
    const expireTime = 300; // 5 minutes in seconds
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: expireTime,
    });

    // Create a new token instance to save in the database.
    const newToken = new UserToken({
      userId: user._id,
      token: token,
    });

    // Set up email transport using nodemailer. This example uses Gmail as the email service.
    const mailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Define the content of the email to be sent.
    let mailDetails = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password!",
      html: `
            <html>
            <head>
            <title>Password Reset Request!</title>
            </head>
            <body>
            <h1>Password Reset Request</h1>
            <p> Dear ${user.userName},</p>
            <p> We have received a request to reset your password for your account with Project App. To complete the password reset process, please click on the button below:</p>
            <a href=${process.env.LIVE_URL}/reset/${token}><button style="background-color: #4caf50; color: white; padding: 14px 20 px; border: none; cursor: pointer; border-radius: 4px;">Reset password</button></a>
            <p> Please note that this link is only valid for 5 mins. If you did not request a password reset, please disregard this message.,</p>
            <p> Thank you,</p>
            <p> Project App Team</p>
            </body>
            </html>
            `,
    };

    // Send the email and handle the success/error cases.
    mailTransporter.sendMail(mailDetails, async (err, data) => {
      if (err) {
        console.error("Error sending mail:", err);
        return res
          .status(500)
          .json(
            CreateError(500, "Something went wrong while sending the email!")
          );
      } else {
        await newToken.save();
        return res
          .status(200)
          .json(CreateSuccess(200, "Email Sent Successfully!"));
      }
    });
  } catch (err) {
    // If there's an unexpected error, log it and return a 500 status.
    console.error("Error processing sendEmail:", err);
    return res
      .status(500)
      .json(CreateError(500, "Server error! Please try again later."));
  }
};

// This controller handles the logic for resetting the user's password.
export const resetPassword = (req, res, next) => {
  const token = req.body.token;
  const newPassword = req.body.password;

  // Verify the token with JWT.
  jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
    if (err) {
      // If the token is invalid or expired, send an error response.
      return res.status(500).json(CreateError(500, "Reset Link is Expired!"));
    } else {
      // If the token is valid, find the user associated with the token's email.
      const response = data;
      const user = await User.findOne({
        email: { $regex: "^" + response.email + "$", $options: "i" },
      });

      // Encrypt the new password.
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(newPassword, salt);
      user.password = encryptedPassword;

      try {
        // Update the user's password in the database.
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $set: user },
          { new: true }
        );
        return res
          .status(200)
          .json(CreateSuccess(200, "Password Reset Success!"));
      } catch (error) {
        // If there's an error updating the password, send an error response.
        return res
          .status(500)
          .json(
            CreateError(
              500,
              "Something went wrong while resetting the password!"
            )
          );
      }
    }
  });
};

// signOut
export const signOut = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err); // Log the error for debugging.
        return res
          .status(500)
          .json(CreateError(500, "Error destroying session!"));
      }
      return res
        .status(200)
        .json(CreateSuccess(200, "You've been signed out!"));
    });
  } catch (err) {
    console.error("Error during sign out:", err); // Log the error for debugging.
    return res.status(500).json(CreateError(500, "Error Signing out!"));
  }
};
