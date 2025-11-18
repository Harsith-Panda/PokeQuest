const mongoose = require("mongoose");

const captureSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    pokemonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pokemon",
      required: true,
    },

    spawnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Spawn",
      default: null,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    // Optional: if your game has CP or IVs
    stats: {
      cp: { type: Number, default: null },
      hp: { type: Number, default: null },
      attack: { type: Number, default: null },
      defense: { type: Number, default: null },
    },
  },
  { timestamps: true },
);

captureSchema.index({ location: "2dsphere" }, { sparse: true });

module.exports = mongoose.model("Capture", captureSchema);
