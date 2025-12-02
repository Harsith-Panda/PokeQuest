const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const user = await userModel.findOne({ username: req.user.username });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const matched = await bcrypt.compare(currentPassword, user.password);

  if (!matched) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  user.password = hashedPassword;

  await user.save();

  res.status(200).json({ message: "Password updated successfully" });
};

const updateUsername = async (req, res) => {
  const { id, username } = req.body;

  const user = await userModel.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.username = username;

  await user.save();

  res.status(200).json({ message: "Username updated successfully" });
};

const updateLocation = async (req, res) => {
  const { id, location } = req.body;

  const user = await userModel.findById(id);

  if (!user) {
    return res.status(401).json({ message: "User not found!" });
  }

  const [lng, lat] = location;

  user.lastLocation = {
    type: "Point",
    coordinates: [lng, lat],
    lastUpdated: new Date(),
  };

  await user.save();

  return res.status(200).json({ message: "Location updated successfully!" });
};

const getUser = async (req, res) => {
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
  updatePassword,
  updateUsername,
  updateLocation,
  getUser,
};
