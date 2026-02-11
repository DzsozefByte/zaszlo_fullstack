// middleware/auth.js
const jwt = require("jsonwebtoken");

// Ez a meglévő middleware-ed
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Hiányzó vagy érvénytelen token." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ message: "Érvénytelen vagy lejárt token." });
  }
};

// ÚJ: Admin ellenőrző middleware
exports.isAdmin = (req, res, next) => {
  // A verifyToken már beállította a req.user-t, amiben benne van a 'szerep'
  if (req.user && req.user.szerep === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: "Hozzáférés megtagadva. Admin jog szükséges!" });
  }
};