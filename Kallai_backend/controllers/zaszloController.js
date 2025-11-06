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
