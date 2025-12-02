const express = require("express");
const router = express.Router();
const {
  updateUsername,
  updatePassword,
  updateLocation,
  getUser,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkMiddleware = require("../middlewares/checkMiddleware");

router
  .put("/update-username", authMiddleware, updateUsername)
  .put("/update-password", authMiddleware, updatePassword)
  .put("/update-location", authMiddleware, updateLocation)
  .get("/get-user", checkMiddleware, getUser);

module.exports = router;
