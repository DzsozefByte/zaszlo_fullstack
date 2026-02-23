// routes/szamlak.js

const express = require('express');
const router = express.Router();
const szamlaController = require('../controllers/szamlaController');
const { verifyToken } = require('../middleware/auth'); // 'authMiddleware' helyett csak 'auth'

// Meglévő poszt kérésed:
router.post('/', verifyToken, szamlaController.createSzamla);

// ÚJ GET kérés a számlák lekéréséhez:
router.get('/', verifyToken, szamlaController.getSajatSzamlak);

module.exports = router;