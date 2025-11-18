const mongoose = require("mongoose");

const inventorySchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pokemon: [
      {
        pokemonTypeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PokemonType",
        },
        capturedAt: { type: Date, default: Date.now },
        stats: {
          // optional if you want custom stats for captured mon
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Inventory", inventorySchema);
