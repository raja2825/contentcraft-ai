const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const OTP = require("../models/OTP");
const { protect } = require("../middleware/authMiddleware");
const { sendOTPEmail } = require("../config/email");

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// ─────────────────────────────────────────
// SIGNUP ROUTES
// ─────────────────────────────────────────

// @route  POST /api/auth/signup/send-otp
// @desc   Check email available + send OTP
router.post("/signup/send-otp", async (req, res) => {
      console.log("Body received:", req.body); 
  const { name, email } = req.body;
  try {
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email, type: "signup" });

    // Generate and save OTP
    const otp = generateOTP();
    await OTP.create({
      email,
      otp,
      type: "signup",
      tempData: { name },
    });

    // Send OTP email
    await sendOTPEmail(email, otp, "signup");

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// @route  POST /api/auth/signup/verify-otp
// @desc   Verify OTP for signup
router.post("/signup/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpRecord = await OTP.findOne({ email, type: "signup" });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Mark as verified
    await OTP.findByIdAndUpdate(otpRecord._id, { verified: true });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed" });
  }
});

// @route  POST /api/auth/signup/complete
// @desc   Complete signup after OTP verified
router.post("/signup/complete", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check OTP was verified
    const otpRecord = await OTP.findOne({ email, type: "signup", verified: true });
    if (!otpRecord) {
      return res.status(400).json({ message: "Email not verified" });
    }

    // Create user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: otpRecord.tempData.name,
      email,
      password: hashedPassword,
    });

    // Delete OTP record
    await OTP.deleteMany({ email, type: "signup" });

    // Set cookie
    const token = generateToken(user._id);
    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        generationsUsed: user.generationsUsed,
        generationsLimit: user.generationsLimit,
      },
    });
  } catch (error) {
    console.error("Signup complete error:", error);
    res.status(500).json({ message: "Failed to create account" });
  }
});

// ─────────────────────────────────────────
// LOGIN ROUTES
// ─────────────────────────────────────────

// @route  POST /api/auth/login/send-otp
// @desc   Check password + send OTP
router.post("/login/send-otp", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Delete existing OTPs
    await OTP.deleteMany({ email, type: "login" });

    // Generate and save OTP
    const otp = generateOTP();
    await OTP.create({ email, otp, type: "login" });

    // Send OTP email
    await sendOTPEmail(email, otp, "login");

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Login OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// @route  POST /api/auth/login/verify-otp
// @desc   Verify OTP and login
router.post("/login/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpRecord = await OTP.findOne({ email, type: "login" });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Delete OTP
    await OTP.deleteMany({ email, type: "login" });

    // Find user and set cookie
    const user = await User.findOne({ email });
    const token = generateToken(user._id);
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        generationsUsed: user.generationsUsed,
        generationsLimit: user.generationsLimit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

// ─────────────────────────────────────────
// COMMON ROUTES
// ─────────────────────────────────────────

// @route  POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
});

// @route  GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;