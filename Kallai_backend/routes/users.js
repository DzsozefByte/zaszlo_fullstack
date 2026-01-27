const express = require("express");
const router = express.Router();

// Controller importálása
const felhasznaloController = require("../controllers/vevocontroller");

// ÚJ: Middleware-ek importálása (destrukturálva)
// Így a 'verifyToken' nevű függvényt emeljük ki az objektumból
const { verifyToken } = require("../middleware/auth");

// ROUTES

// Regisztráció
router.post("/register", felhasznaloController.register);

// Login
router.post("/login", felhasznaloController.login);

// Refresh token
router.post("/refresh-token", felhasznaloController.refreshToken);

// Profil lekérése (védett)
// Itt az 'auth' helyett most már a 'verifyToken' függvényt használjuk
router.get("/profil", verifyToken, felhasznaloController.profil);

// ÚJ: Kijelentkezés
router.post("/logout", felhasznaloController.logout);

module.exports = router;