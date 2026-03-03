const express = require("express");
const router = express.Router();

const szamlaController = require("../controllers/szamlaController");
const { verifyToken, isAdmin } = require("../middleware/auth");

router.get("/payment-methods", szamlaController.getFizetesiModok);

router.post("/", verifyToken, szamlaController.createSzamla);
router.get("/", verifyToken, szamlaController.getSajatSzamlak);

router.get("/admin", verifyToken, isAdmin, szamlaController.adminGetSzamlak);
router.post(
  "/admin/payment-methods",
  verifyToken,
  isAdmin,
  szamlaController.adminCreateFizetesiMod
);
router.delete(
  "/admin/payment-methods/:id",
  verifyToken,
  isAdmin,
  szamlaController.adminDeleteFizetesiMod
);
router.delete("/admin/:id", verifyToken, isAdmin, szamlaController.adminDeleteSzamla);

module.exports = router;
