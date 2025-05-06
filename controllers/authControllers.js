import bcrypt from "bcryptjs"; // Import bcrypt for password hashing
import User from "../models/userModel.js"; // Import the User model
import jwt from "jsonwebtoken"; // Import jsonwebtoken for generating tokens
import transporter from "../config/nodemailer.js"; // Import the nodemailer transporter
import userModel from "../models/userModel.js";

// Register a new user
export const register = async (req, res) => {
  const { name, email, password } = req.body; // Extract name, email, and password from the request body

  // Check if all required fields are provided
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();

    // Generate a JWT token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set the token as a cookie in the response
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    // SENDING WELLLCOME EMAIL
    const mailOptions = {
      from: process.env.SENDER_EMIAL,
      to: email,
      subject: "Welcome to Our Service",
      text: `Hello ${name},\n\nThank you for registering with us! We're excited to have you on board.\n\nBest regards,\nThe Team : ${email}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    // Respond with a success message
    return res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Login an existing user
export const login = async (req, res) => {
  const { email, password } = req.body; // Extract email and password from the request body

  // Check if all required fields are provided
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set the token as a cookie in the response
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // Respond with a success message
    return res
      .status(200)
      .json({ success: true, message: "User logged in successfully" });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Logout the user
export const logout = async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
    });

    // Respond with a success message
    return res
      .status(200)
      .json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Verify the user's email address

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body; // Extract userId from the request body
    const user = await userModel.findById(userId); // Find the user by ID
    if (user.isaccountVerified) {
      return res.status(400).json({ message: "Account already verified" }); // If the account is already verified, send an error response
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp; // Set the OTP for the user
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save(); // Save the user with the new OTP
    const mailOptions = {
      from: process.env.SENDER_EMIAL, // Sender's email address
      to: user.email, // Recipient's email address
      subject: "Verify your account", // Email subject
      text: `Your OTP is ${otp}`, // Email body with the OTP
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully" }); // Send a success response
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { otp, userId } = req.body;

  if (!otp || !userId) {
    return res.status(400).json({ message: "OTP and userId are required" });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();
    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// check if the user is authenticated
export const isAuthenticated = async (req, res) => {
  try {
    return res.status(200).json({ success: true, user: req.user }); // Send the authenticated user's information in the response
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// Send password reset OTP
export const sendResetOtp = async (req, res) => {
  const {email} = req.body; // 

     if(!email) {
        return res.status(400).json({ message: "Email is required" });
     }

     try(!user){
      return res.json({ message: "User not found" });
     }
      
      catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ message: "Internal server error" });
      }
    }
