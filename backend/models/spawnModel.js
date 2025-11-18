const mongoose = require("mongoose");

const spawnSchema = new mongoose.Schema(
  {
    pokemonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pokemon",
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true, // [lng, lat]
      },
    },

    // Used for clean up (later tie up with cron job)
    despawnAt: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Marked when someone captures it
    caughtBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

spawnSchema.index({ location: "2dsphere" }, { sparse: true });
spawnSchema.index({ despawnAt: 1 });

module.exports = mongoose.model("Spawn", spawnSchema);
