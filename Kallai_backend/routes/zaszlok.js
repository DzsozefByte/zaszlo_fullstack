const express = require('express');
const router = express.Router();
const zaszlo = require('../controllers/zaszloController');
const { verifyToken, isAdmin } = require('../middleware/auth'); // Importáljuk a middleware-eket

router.get('/', zaszlo.getAllZaszlok);
router.get('/search', zaszlo.filterZaszlok);
router.get('/:id', zaszlo.getById);

// Csak bejelentkezett ADMIN törölhet!
router.delete('/:id', verifyToken, isAdmin, zaszlo.delete);

module.exports = router;