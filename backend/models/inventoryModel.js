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
          ref: "Pokemon",
        },
        capturedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inventory", inventorySchema);
