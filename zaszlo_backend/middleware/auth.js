const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Be kell jelentkezned a művelethez!" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // A tokenben lévő adatokat (id, szerep) rátesszük a kérésre
        next();
    } catch (error) {
        return res.status(401).json({ message: "Érvénytelen vagy lejárt munkamenet." });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.szerep === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: "Admin jog szükséges!" });
    }
};