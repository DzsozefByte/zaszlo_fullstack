const express = require("express");
const router = express.Router();

const felhasznaloController = require("../controllers/vevocontroller");
const { verifyToken } = require("../middleware/auth");

router.post("/register", felhasznaloController.register);
router.post("/login", felhasznaloController.login);
router.post("/refresh-token", felhasznaloController.refreshToken);

router.get("/profil", verifyToken, felhasznaloController.profil);
router.put("/profil/update", verifyToken, felhasznaloController.updateProfil);

router.post("/logout", felhasznaloController.logout);

module.exports = router;
