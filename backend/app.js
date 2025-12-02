require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 4020;
const connectDB = require("./config/db");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const spawnRouter = require("./routes/spawnRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(
  cors({
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true,
  }),
);

connectDB();

app.use(cookieParser());
app.use(express.json());

app.options("/api", cors());
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/spawn", spawnRouter);

app.get("/health-check", (req, res) => {
  return res.status(200).send("Works good!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});

// module.exports = app;
