const express = require('express');
const router = express.Router();
const zaszlo = require('../controllers/zaszloController');

// GET /zaszlok – az összes ország lekérdezése
router.get('/', zaszlo.getAllZaszlok);
router.get('/search', zaszlo.filterZaszlok);
router.delete('/:id', zaszlo.delete);
router.get('/:id', zaszlo.getById);

module.exports = router;