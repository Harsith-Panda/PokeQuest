require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 4020;
const connectDB = require("./config/db");
const authRouter = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middlewares/authMiddleware");
const cors = require("cors");

const allowedOrigins = [
  "http://127.0.0.1:4030",
  "https://poke-quest-web.vercel.app",
];

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);

connectDB();

app.use(cookieParser());
app.use(express.json());

app.options("/api", cors());

app.set("trust proxy", 1);

// app.use((req, res, next) => {
//   if (!isConnected) {
//     connectDBNow();
//   }
//   next();
// });

app.use("/api/auth", authRouter);

app.get("/health-check", (req, res) => {
  return res.status(200).send("Works good!");
});

app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Protected route accessed!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});

// module.exports = app;
