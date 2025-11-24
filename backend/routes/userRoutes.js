const express = require("express");
const router = express.Router();
const {
  updateUsername,
  updatePassword,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router
  .put("/update-username", authMiddleware, updateUsername)
  .put("/update-password", authMiddleware, updatePassword);

module.exports = router;
