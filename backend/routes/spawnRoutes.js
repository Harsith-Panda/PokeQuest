const express = require("express");
const router = express.Router();
const {
  captureSpawn,
  generateSpawns,
  getUserSpawns,
  getInventory,
  getLeaderboard,
} = require("../controllers/spawnController");
const authmw = require("../middlewares/authMiddleware");

router.get("/leaderboard", getLeaderboard);

router.use(authmw);

router
  .get("/generate-spawns", generateSpawns)
  .post("/capture-spawn", captureSpawn)
  .get("/user-spawns", getUserSpawns)
  .get("/getinventory", getInventory);

module.exports = router;
