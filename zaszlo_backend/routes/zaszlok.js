const express = require("express");
const router = express.Router();

const zaszlo = require("../controllers/zaszloController");
const { verifyToken, isAdmin } = require("../middleware/auth");

router.get("/", zaszlo.getAllZaszlok);
router.get("/search", zaszlo.filterZaszlok);

router.get("/admin-list", verifyToken, isAdmin, zaszlo.getAdminZaszlok);
router.get("/admin/meta", verifyToken, isAdmin, zaszlo.getAdminMeta);
router.put("/admin/countries/:id", verifyToken, isAdmin, zaszlo.updateCountry);
router.post("/admin/sizes", verifyToken, isAdmin, zaszlo.createMeret);
router.post("/admin/materials", verifyToken, isAdmin, zaszlo.createAnyag);

router.post("/", verifyToken, isAdmin, zaszlo.create);
router.post("/upload/:orszagId", verifyToken, isAdmin, zaszlo.uploadImage);
router.delete("/:id", verifyToken, isAdmin, zaszlo.delete);

router.get("/:id", zaszlo.getById);

module.exports = router;
