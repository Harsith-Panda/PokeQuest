const spawnModel = require("../models/spawnModel");
const userModel = require("../models/userModel");
const pokemonModel = require("../models/pokemonModel");
const inventoryModel = require("../models/inventoryModel");

// Helper functions

function calculateLevel(xp) {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

function randomPointAround([lng, lat], radiusMeters = 500) {
  const earthRadius = 6378137;

  const dn = (Math.random() - 0.5) * 2 * radiusMeters;
  const de = (Math.random() - 0.5) * 2 * radiusMeters;

  const dLat = dn / earthRadius;
  const dLng = de / (earthRadius * Math.cos((lat * Math.PI) / 180));

  return [lng + (dLng * 180) / Math.PI, lat + (dLat * 180) / Math.PI];
}

// This is called haversine formula (Got from internet)
function getDistanceInMeters([lng1, lat1], [lng2, lat2]) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Actual Controllers

const generateSpawns = async (req, res) => {
  try {
    const userId = req.user.id;

    const userLocation = await userModel
      .findById(userId)
      .select("lastLocation.coordinates lastSpawnedAt");

    const coordinates = userLocation?.lastLocation?.coordinates;
    const lastSpawn = userLocation?.lastSpawnedAt;

    if (coordinates == [0, 0]) {
      return res.status(400).json({ message: "User location is not set" });
    }

    const SIX_HOURS = 6 * 60 * 60 * 1000;

    if (lastSpawn && Date.now() - lastSpawn.getTime() < SIX_HOURS) {
      return res
        .status(403)
        .json({ spawns: [], message: "Spawns already generated." });
    }

    const pokemons = await pokemonModel.find({});

    if (pokemons.length === 0) {
      return res.status(500).json({ message: "No Pokemon in database." });
    }

    const selected = pokemons.sort(() => 0.5 - Math.random()).slice(0, 5);

    const spawns = selected.map((p) => ({
      pokemonId: p._id,
      location: {
        type: "Point",
        coordinates: randomPointAround(coordinates, 500),
      },
      despawnAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
    }));

    await spawnModel.deleteMany({
      despawnAt: { $lt: new Date() },
    });

    await spawnModel.insertMany(spawns);

    await userModel.findByIdAndUpdate(userId, { lastSpawnedAt: new Date() });

    return res.status(200).json({ spawns });
  } catch (e) {
    console.error(e);

    res.status(500).json({ message: "Internal server error." });
  }
};

const captureSpawn = async (req, res) => {
  try {
    const userId = req.user.id;
    const { spawnId } = req.body;

    const spawn = await spawnModel.findById(spawnId);

    if (!spawn) {
      return res.status(404).json({ message: "Spawn not found" });
    }

    if (spawn.expiresAt < new Date()) {
      await spawn.deleteOne();
      return res.status(400).json({ message: "Pokemon has already despawned" });
    }

    const user = await userModel
      .findById(userId)
      .select("lastLocation stats inventoryId");

    if (
      !user.lastLocation?.coordinates ||
      !user.lastLocation?.coordinates == [0, 0]
    ) {
      return res.status(400).json({ message: "User location not set" });
    }

    const userLocation = user.lastLocation.coordinates;
    const spawnLocation = spawn.location.coordinates;

    const distance = getDistanceInMeters(spawnLocation, userLocation);

    if (distance > 100) {
      return res.status(400).json({ message: "Too far from pokemon" });
    }

    const pokemon = await pokemonModel.findById(spawn.pokemonId);

    if (!pokemon) {
      return res.status(404).json({ message: "Pokemon not found" });
    }

    user.stats.totalCaptures += 1;
    user.stats.xp += pokemon.baseXp;

    const newLevel = calculateLevel(user.stats.xp);
    user.stats.level = newLevel;

    await user.save();
    await spawn.deleteOne();

    const inventory = await inventoryModel.findOne({ userId: userId });
    inventory.pokemon.push({ pokemonTypeId: spawn.pokemonId });
    await inventory.save();

    res.status(200).json({
      message: "Pokemon captured!",
      pokemon: pokemon.name,
      gainedXp: pokemon.baseXp,
      newLevel,
      totalXp: user.stats.xp,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getUserSpawns = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    const spawns = await spawnModel
      .find({
        isActive: true,
        despawnAt: { $gte: new Date() },
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 600,
          },
        },
      })
      .populate("pokemonId")
      .lean();

    res.json({
      success: true,
      spawns,
    });
  } catch (error) {
    console.error("Error fetching user spawns", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getInventory = async (req, res) => {
  const userId = req.user.id;

  try {
    const inventory = await inventoryModel
      .findOne({ userId: userId })
      .populate("pokemon.pokemonTypeId");

    res.status(200).json({ inventory: inventory });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const users = await userModel
      .find({})
      .sort({ "stats.xp": -1 })
      .select("username stats.xp stats.level stats.totalCaptures");

    // Add ranks to users
    const usersWithRanks = users.map((user, index) => ({
      ...user.toObject(),
      rank: index + 1,
    }));

    // Find current user if authenticated
    let currentUser = null;
    if (req.user) {
      const userIndex = usersWithRanks.findIndex(
        (u) => u._id.toString() === req.user.id
      );
      if (userIndex !== -1) {
        currentUser = usersWithRanks[userIndex];
      }
    }

    return res.status(200).json({
      users: usersWithRanks,
      currentUser,
      totalUsers: usersWithRanks.length,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  generateSpawns,
  captureSpawn,
  getUserSpawns,
  getInventory,
  getLeaderboard,
};
