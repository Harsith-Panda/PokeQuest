require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 4020;
const connectDB = require("./config/db");
const authRouter = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middlewares/authMiddleware");
const cors = require("cors");

connectDB();

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true,
  }),
);

app.options("*", cors());

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
