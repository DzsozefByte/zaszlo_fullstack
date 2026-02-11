const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // A te pontos útvonalad a gépeden:
    const uploadPath = 'C:\\Users\\13d\\Documents\\zaszlo_fullstack\\zaszlo_frontend_veet\\public\\images';
    
    // Biztonsági ellenőrzés: ha nem létezne a mappa, létrehozza (opcionális)
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // A fájl neve az orszagId lesz, amit az URL-ből kapunk: /upload/:orszagId
    const orszagId = req.params.orszagId;
    cb(null, `${orszagId}.png`);
  }
});

const upload = multer({ storage: storage });

exports.uploadImage = [
  upload.single('image'), // Fontos, hogy a Frontend is 'image' néven küldje!
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Nem érkezett fájl!' });
    }
    res.status(200).json({ 
      message: 'Kép sikeresen feltöltve!', 
      filename: req.file.filename 
    });
  }
];


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

exports.filterZaszlok = async (req, res) => {
    try {
        const meret = req.query.meret;
        const anyag = req.query.anyag;
        const kontinens = req.query.kontinens;
        const orszag = req.query.orszag;
        const zaszlok = await Zaszlo.filter(meret, anyag, kontinens, orszag);
        res.json(zaszlok);
    } catch (error) {
        res.status(500).json({ message: 'Hiba történt a zászlók szűrése során: ', error: error.message });
    }
};

exports.create = async (req, res) => {
  try {
    const { orszag, meretId, anyagId, ar, kontinens } = req.body;
    
    // A modellnek vissza kell adnia az új rekord adatait (insertId és orszagId)
    const result = await Zaszlo.create({ orszag, meretId, anyagId, ar, kontinens });
    
    // VISSZAKÜLDJÜK AZ ID-kat! Ez a kulcs a képfeltöltéshez.
    res.status(201).json({ 
      message: 'Zászló sikeresen hozzáadva!',
      id: result.insertId,
      orszagId: result.orszagId // A frontend ebből tudja, hogy pl. "194.png" lesz a név
    });
  } catch (error) {
    console.error("Create hiba:", error);
    res.status(500).json({ message: 'Hiba történt', error: error.message });
  }
};
exports.getAdminZaszlok = async (req, res) => {
  try {
    const zaszlok = await Zaszlo.getAdminList();
    res.json(zaszlok);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Hiba az admin lista lekérésekor' });
  }
};
