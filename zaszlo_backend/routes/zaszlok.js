const express = require('express');
const router = express.Router();
const zaszlo = require('../controllers/zaszloController');
const { verifyToken, isAdmin } = require('../middleware/auth'); // Importáljuk a middleware-eket

router.get('/', zaszlo.getAllZaszlok);
router.get('/search', zaszlo.filterZaszlok);

// EZ LEGYEN ELŐBB:
router.get('/admin-list', verifyToken, isAdmin, zaszlo.getAdminZaszlok);

// EZ LEGYEN UTÁNA (különben az admin-list szót ID-nak nézi):
router.get('/:id', zaszlo.getById);

router.post('/', verifyToken, isAdmin, zaszlo.create);
router.delete('/:id', verifyToken, isAdmin, zaszlo.delete);

// Új kép feltöltése egy adott országhoz
router.post('/upload/:orszagId', verifyToken, isAdmin, zaszlo.uploadImage);


module.exports = router;