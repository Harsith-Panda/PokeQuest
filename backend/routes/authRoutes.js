const express = require("express");
const router = express.Router();
const {
  signUp,
  login,
  handleRefresh,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerificationEmail,
  logout,
  checkUsername,
  checkEmail,
  handleAuthMe,
} = require("../controllers/authControllers");
const authMiddleware = require("../middlewares/authMiddleware");

router
  .post("/signup", signUp)
  .post("/verify-email", verifyEmail)
  .post("/login", login)
  .post("/logout", logout)
  .post("/refresh", handleRefresh)
  .post("/request-reset", forgotPassword)
  .post("/reset-password", resetPassword)
  .post("/resend-verify-email", resendVerificationEmail)
  .post("/check-username", checkUsername)
  .post("/check-email", checkEmail)
  .get("/me", authMiddleware, handleAuthMe);
module.exports = router;
