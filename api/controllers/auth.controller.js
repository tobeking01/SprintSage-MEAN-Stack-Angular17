// Import necessary libraries, models, and utility functions for user authentication and error handling.
import Role from "../models/Role.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs"; // Used for password hashing.
import jwt from "jsonwebtoken"; // Used for token creation.
import nodemailer from "nodemailer"; // Used for sending email.
import { CreateError } from "../utils/error.js"; // Custom utility function for handling errors.
import { CreateSuccess } from "../utils/success.js"; // Custom utility function for handling success messages.
import UserToken from "../models/UserToken.js";

// `registerStudentProfessor` function handles the process of registering a new Student or Professor.
export const registerStudentProfessor = async (req, res, next) => {
  try {
    // Extract relevant fields from request body
    const {
      firstName,
      lastName,
      userName,
      email,
      password,
      role,
      schoolYear,
      expectedGraduation,
      professorTitle,
      professorDepartment,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !userName || !email || !password || !role) {
      return res.status(400).json(CreateError(400, "All fields are required."));
    }

    // Check role and validate accordingly
    if (!["Student", "Professor"].includes(role)) {
      return res.status(400).json(CreateError(400, "Invalid role."));
    }

    // For 'Student' role, validate student-specific fields
    if (role === "Student" && (!schoolYear || !expectedGraduation)) {
      return res
        .status(400)
        .json(CreateError(400, "Student-specific fields are required."));
    }

    // For 'Professor' role, validate professor-specific fields
    if (role === "Professor" && (!professorTitle || !professorDepartment)) {
      return res
        .status(400)
        .json(CreateError(400, "Professor-specific fields are required."));
    }

    // Find role in the Role collection
    const roleDoc = await Role.findOne({ name: role });
    if (!roleDoc) {
      return res.status(400).json(CreateError(400, `${role} role not found.`));
    }

    // Check if user with same email or username already exists
    const userExists = await User.findOne({
      $or: [{ email }, { userName }],
    });
    if (userExists) {
      return res
        .status(409)
        .json(CreateError(409, "Email or Username already exists."));
    }

    // Encrypt password for security
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create a new user instance and populate fields
    const newUser = new User({
      firstName,
      lastName,
      userName,
      email,
      password: hashPassword,
      roles: [roleDoc._id],
      schoolYear: role === "Student" ? schoolYear : undefined,
      expectedGraduation: role === "Student" ? expectedGraduation : undefined,
      professorTitle: role === "Professor" ? professorTitle : undefined,
      professorDepartment:
        role === "Professor" ? professorDepartment : undefined,
    });

    // Save the new user to the database
    await newUser.save();

    // Send success response
    res.status(200).json(CreateSuccess(200, "Registration Successfully!"));
  } catch (error) {
    // Handle errors and send them to the next middleware
    console.error("Error registering user:", error);
    next(CreateError(500, "Error registering user!"));
  }
};

// `login` function handles the user authentication process.
export const login = async (req, res, next) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res
        .status(400)
        .json(CreateError(400, "Username and password are required."));
    }

    // Fetch the user associated with the provided userName. Also, populate the associated roles.
    const user = await User.findOne({ userName }).populate("roles");

    // If no user is found with the provided email, return an error.
    if (!user) {
      return res
        .status(404)
        .json(CreateError(404, "User with the given userName not found."));
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
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // set to true in production when using HTTPS
        sameSite: "Strict", // for CSRF protection
      })
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

// register Admin
export const registerAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, userName, email, password, role } = req.body;

    console.log("Processing registration for role:", role); // Logging the received role

    if (!firstName || !lastName || !userName || !email || !password || !role) {
      return next(CreateError(400, "All fields including role are required."));
    }

    // More detailed log about the values received
    console.log(
      `Received details - firstName: ${firstName}, lastName: ${lastName}, userName: ${userName}, email: ${email}, role: ${role}`
    );

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const adminRole = await Role.findOne({ name: "Admin" });
    if (!adminRole)
      return next(
        CreateError(400, "Admin role does not exist in the database.")
      );

    const userExists = await User.findOne({ $or: [{ email }, { userName }] });
    if (userExists)
      return next(CreateError(409, "Email or Username already exists."));

    const newAdminUser = new User({
      firstName,
      lastName,
      userName,
      email,
      password: hashPassword,
      roles: [adminRole._id],
    });
    await newAdminUser.save();

    res
      .status(200)
      .json(CreateSuccess(200, "Admin Registration Successfully!"));
  } catch (error) {
    console.error("Error registering Admin:", error);
    next(CreateError(500, "Internal Server Error while registering Admin!"));
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
      return res.status(204).send(); // No content to send.
    });
  } catch (err) {
    console.error("Error during sign out:", err); // Log the error for debugging.
    return res.status(500).json(CreateError(500, "Error Signing out!"));
  }
};
