const jwt = require("jsonwebtoken");
require("dotenv").config();

const checkMiddleware = (req, res, next) => {
  const accessToken = req.headers["x-access-token"];

  if (!accessToken) {
    return res.status(404).json({ message: "Unauthorized" });
  }

  jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = decoded;
    next();
  });
};

module.exports = checkMiddleware;
