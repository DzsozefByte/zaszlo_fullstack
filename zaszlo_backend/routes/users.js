const express = require("express");
const router = express.Router();

const felhasznaloController = require("../controllers/vevocontroller");
const { verifyToken, isAdmin } = require("../middleware/auth");

router.post("/register", felhasznaloController.register);
router.post("/login", felhasznaloController.login);
router.post("/refresh-token", felhasznaloController.refreshToken);

router.get("/profil", verifyToken, felhasznaloController.profil);
router.put("/profil/update", verifyToken, felhasznaloController.updateProfil);

router.get("/admin/users", verifyToken, isAdmin, felhasznaloController.adminGetUsers);
router.put("/admin/users/:id/role", verifyToken, isAdmin, felhasznaloController.adminUpdateUserRole);
router.delete("/admin/users/:id", verifyToken, isAdmin, felhasznaloController.adminDeleteUser);

router.post("/logout", felhasznaloController.logout);

module.exports = router;
