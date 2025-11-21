const userModel = require("../models/userModel");
const inventoryModel = require("../models/inventoryModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
require("dotenv").config();
const production = process.env.PRODUCTION === "true";
const {
  sendVerifyEmail,
  sendResetPasswordEmail,
} = require("../services/emailService");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  const { username, email, password } = req.body;

  // 1. Checking request body
  if (!email || !password || !username) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // 2. Check for existing users
    const username_check = await userModel.findOne({ username: username });
    const email_check = await userModel.findOne({ email: email });

    if (username_check || email_check) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    // 3. Hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generating email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 1000 * 60 * 30; // 30 minutes expiry

    // 4. Genrating user
    const user = await userModel.create({
      username: username,
      email: email,
      password: hashedPassword,
      verified: false,
      verificationToken: verificationToken,
      verificationTokenExpiresAt: expiry,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
      lastLocation: {
        type: "Point",
        coordinates: [0, 0],
        lastUpdated: null,
      },
      stats: { totalCaptures: 0, xp: 0, level: 1 },
      inventoryId: null,
    });

    // 5. Generating inventory for user
    const inv = await inventoryModel.create({
      userId: user._id,
      items: [],
    });

    // 6. Assign inventory id to user
    user.inventoryId = inv._id;
    await user.save();

    // 7. Send verification email
    await sendVerifyEmail(email, username, verificationToken);

    // 8. Send response from server when all process is successful
    return res.status(201).json({
      message: "Signup successful. Please verify your email before logging in.",
    });
  } catch (e) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: e.message });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await userModel.findOne({ verificationToken: token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verificationTokenExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Verification token expired" });
    }

    user.verificationToken = null;
    user.emailVerified = true;
    user.verificationTokenExpiresAt = null;

    await user.save();

    return res.status(200).json({ message: "Email verified successfully!" });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: e.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    const matched = await bcrypt.compare(password, user.password);

    if (!matched) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "3m",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: production, // required for cross-site cookies
      sameSite: production ? "none" : "lax", // required for frontend-backend different domains
      domain: process.env.DOMAIN_COOKIE,
      path: "/", // accessible everywhere
      maxAge: 1000 * 60 * 15,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: production,
      sameSite: production ? "none" : "lax",
      path: "/api/auth/refresh",
      domain: process.env.DOMAIN_COOKIE,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.setHeader("Access-Control-Allow-Credentials", "true");

    const response = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
      lastLocation: user.lastLocation,
      stats: user.stats,
      inventoryId: user.inventoryId,
    };

    return res.status(200).json({
      success: true,
      user: response,
      message: "Logged in successfully!",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: e.message,
    });
  }
};

const handleRefreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "3m",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: production,
      sameSite: production ? "none" : "lax",
      path: "/api/auth/refresh",
      domain: process.env.DOMAIN_COOKIE,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: production, // required for cross-site cookies
      sameSite: production ? "none" : "lax", // required for frontend-backend different domains
      path: "/", // accessible everywhere
      domain: process.env.DOMAIN_COOKIE,
      maxAge: 1000 * 60 * 15,
    });

    res.setHeader("Access-Control-Allow-Credentials", "true");

    return res.status(200).json({ message: "Token refreshed successfully!" });
  });
};

const requestForgotPassword = async (req, res) => {
  const { email } = req.body;

  const resetPasswordToken = crypto.randomBytes(32).toString("hex");
  const resetPasswordExpiresAt = Date.now() + 3600000; // 1 hour from now

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordExpiresAt = resetPasswordExpiresAt;

  await user.save();

  await sendResetPasswordEmail(email, user.username, resetPasswordToken);

  return res.status(200).json({ message: "Password reset email sent!" });
};

const resetPassword = async (req, res) => {
  const { token } = req.body;
  const { password } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  const user = await userModel.findOne({ resetPasswordToken: token });

  if (!user) {
    return res.status(404).json({ message: "Invalid token" });
  }

  if (user.resetPasswordExpiresAt < Date.now()) {
    return res.status(400).json({ message: "Token expired" });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpiresAt = null;

  await user.save();

  return res.status(200).json({ message: "Password reset successfully!" });
};

const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.emailVerified) {
    return res.status(400).json({ message: "Email already verified" });
  }

  // Generate new token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiresAt = Date.now() + 3600 * 1000; // 1 hour

  user.verificationToken = verificationToken;
  user.verificationTokenExpiresAt = verificationTokenExpiresAt;

  await user.save();

  await sendVerifyEmail(user.email, user.username, verificationToken);

  return res.status(200).json({ message: "New verification email sent" });
};

const logout = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: production,
      sameSite: production ? "none" : "lax",
      domain: process.env.DOMAIN_COOKIE,
      path: "/",
    };

    // Clear cookies
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    res.setHeader("Access-Control-Allow-Credentials", "true");

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("Logout Error:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const checkUsername = async (req, res) => {
  const { username } = req.body;

  const user = await userModel.findOne({ username });

  return res.status(200).json({ available: !user });
};

const checkEmail = async (req, res) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });

  return res.status(200).json({ available: !user });
};

const handleAuthMe = async (req, res) => {
  const user = await userModel.findOne({ username: req.user.username });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const response = {
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
    emailVerified: user.emailVerified,
    lastLocation: user.lastLocation,
    stats: user.stats,
    inventoryId: user.inventoryId,
  };

  return res.status(200).json({ success: true, data: response });
};

module.exports = {
  signUp: signup, // Sign up users body -> username, email, password
  verifyEmail: verifyEmail, // Verify email id '/verify-email?token=<token>' token in req.query
  login: login, // email, password in body
  handleRefresh: handleRefreshToken, // refresh-token from cookies
  forgotPassword: requestForgotPassword, // email in body
  resetPassword: resetPassword, // password in body
  resendVerificationEmail: resendVerificationEmail, // email in body
  logout: logout, // nothing required empties the cookies
  checkUsername: checkUsername, // Gets username in body
  checkEmail: checkEmail, // Gets email in body
  handleAuthMe: handleAuthMe,
};
