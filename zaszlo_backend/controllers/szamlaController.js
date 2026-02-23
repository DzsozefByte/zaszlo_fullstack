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

exports.getSajatSzamlak = async (req, res) => {
    try {
        // Ellenőrizzük, hogy van-e user a req-ben (a middleware rakja bele)
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Azonosítási hiba! Kérjük, jelentkezz be újra." });
        }

        const vevoIdFromToken = req.user.id;
        const szamlak = await Szamla.getByUserId(vevoIdFromToken);
        
        // Itt a RETURN kulcsszó a legfontosabb!
        return res.status(200).json(szamlak);

    } catch (err) {
        console.error("Hiba a számlák lekérésekor:", err);
        // Itt is kell a RETURN!
        return res.status(500).json({ 
            message: "Hiba történt a számlák lekérésekor", 
            error: err.message 
        });
    }
};