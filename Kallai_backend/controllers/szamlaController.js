const Szamla = require('../models/szamlaModel');

exports.createSzamla = async (req, res) => {
    try {
        const { fizetesiMod, kosar } = req.body;
        // A verifyToken middleware ide rakta nekünk az ID-t:
        const vevoIdFromToken = req.user.id; 

        if (!vevoIdFromToken) {
            return res.status(401).json({ message: "Azonosítási hiba!" });
        }

        const eredmeny = await Szamla.create(vevoIdFromToken, fizetesiMod, kosar);
        res.status(201).json(eredmeny);
    } catch (err) {
        res.status(500).json({ message: "Hiba történt", error: err.message });
    }
};