// routes/szamlak.js
const express = require('express');
const router = express.Router();
const szamlaController = require('../controllers/szamlaController');
const { verifyToken } = require('../middleware/auth'); // Importáld a middleware-t

// Csak bejelentkezett felhasználó küldhet rendelést
router.post('/', verifyToken, szamlaController.createSzamla);

module.exports = router;