const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  try {
    const token = req.header("Authorization").split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.email = decoded.email;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = verifyToken;
