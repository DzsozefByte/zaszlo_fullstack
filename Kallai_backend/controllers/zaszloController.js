const Zaszlo = require('../models/zaszloModel');

exports.getAllZaszlok = async (req, res) => {
  try {
    const zaszlok = await Zaszlo.getAll();
    res.json(zaszlok); // JSON formátumban visszaadja az adatokat
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Hiba történt az országok lekérdezésekor' });
  }
};

exports.delete = async (req, res) => {
    const id = req.params.id;
    try {
        const eredmeny = await Zaszlo.delete(id);
        if (eredmeny) {
            return res.json({ message: 'Zászló sikeresen törölve!' });
        }
        else {
            return res.status(404).json({ message: 'A törölni kívánt zászló nem található!' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Hiba történt a zászló törlése során: ', error: error.message });
    }
};

exports.getById = async (req, res) => {
    const id = req.params.id;
    try {
        const zaszlo = await Zaszlo.getById(id);
        if (zaszlo) {
            return res.json(zaszlo);
        }
        else {
            return res.status(404).json({ message: 'A kiválasztott zászló nem található' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Hiba történt a zászló lekérése során: ', error: error.message });
    }
};
