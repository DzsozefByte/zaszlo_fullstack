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
            return res.json({ message: 'Zaszlo sikeresen torolve' });
        }
        else {
            return res.status(404).json({ message: 'A torolni kivant zaszlo nem talalhato' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Hiba tortent az orszag torlese soran', error: error.message });
    }
};

