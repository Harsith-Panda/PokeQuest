const mongoose = require("mongoose");

const pokemonSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      default: "",
    },

    rarity: {
      type: String,
      enum: ["common", "uncommon", "rare", "epic", "legendary"],
      default: "common",
    },

    baseXp: {
      type: Number,
      default: 10, // XP awarded when captured
    },

    // Map icon image
    spriteUrl: {
      type: String,
      required: true,
    },

    // Optional type/category (Fire, Water, Grass etc.)
    elementType: {
      type: String,
      enum: [
        "normal",
        "fire",
        "water",
        "grass",
        "electric",
        "psychic",
        "rock",
        "ice",
        "dragon",
        "fairy",
      ],
      default: "normal",
    },

    // Color for UI / map theming
    color: {
      type: String,
      default: "#FFFFFF",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Pokemon", pokemonSchema);
