const express = require("express");
const router = express.Router();

// Controller importálása
const felhasznaloController = require("../controllers/vevocontroller");

// Validatorok importálása

const auth = require("../middleware/auth");


// ROUTES

// Regisztráció
router.post("/register", felhasznaloController.register);

// Login
router.post("/login", felhasznaloController.login);

// Refresh token
router.post("/refresh-token", felhasznaloController.refreshToken);

// védett útvonal
router.get("/profil", auth, felhasznaloController.profil);


module.exports = router;