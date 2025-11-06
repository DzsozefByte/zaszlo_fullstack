const express = require('express');
const router = express.Router();
const zaszlo = require('../controllers/zaszloController');

// GET /zaszlok – az összes ország lekérdezése
router.get('/', zaszlo.getAllZaszlok);

module.exports = router;
