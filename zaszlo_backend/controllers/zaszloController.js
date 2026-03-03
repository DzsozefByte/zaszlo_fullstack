const multer = require("multer");
const fs = require("fs");

const Zaszlo = require("../models/zaszloModel");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath =
      "C:\\Users\\13d\\Documents\\zaszlo_fullstack\\zaszlo_frontend_veet\\public\\images";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.orszagId}.png`);
  },
});

const upload = multer({ storage });

const toInt = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const toPositiveNumber = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const parseIdArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return [...new Set(value.map(Number).filter((item) => Number.isInteger(item) && item > 0))];
};

exports.uploadImage = [
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Nem erkezett fajl." });
    }
    return res.status(200).json({
      message: "Kep sikeresen feltoltve.",
      filename: req.file.filename,
    });
  },
];

exports.getAllZaszlok = async (req, res) => {
  try {
    const zaszlok = await Zaszlo.getAll();
    return res.json(zaszlok);
  } catch (error) {
    return res.status(500).json({ message: "Hiba tortent az orszagok lekerdezese kozben." });
  }
};

exports.getAdminZaszlok = async (req, res) => {
  try {
    const zaszlok = await Zaszlo.getAdminList();
    return res.json(zaszlok);
  } catch (error) {
    return res.status(500).json({ message: "Hiba az admin lista lekerdezese kozben." });
  }
};

exports.getAdminMeta = async (req, res) => {
  try {
    const meta = await Zaszlo.getAdminMeta();
    return res.json(meta);
  } catch (error) {
    return res.status(500).json({ message: "Hiba az alapadatok lekerdezese kozben." });
  }
};

exports.updateCountry = async (req, res) => {
  try {
    const orszagId = toInt(req.params.id);
    const orszag = typeof req.body.orszag === "string" ? req.body.orszag.trim() : "";
    const kontinensId = toInt(req.body.kontinensId);

    if (!orszagId || !orszag || !kontinensId) {
      return res.status(400).json({ message: "Hianyzo vagy ervenytelen adatok." });
    }

    const updated = await Zaszlo.updateCountry(orszagId, { orszag, kontinensId });
    if (!updated) {
      return res.status(404).json({ message: "Nem talalhato ilyen orszag." });
    }

    return res.json({
      message: "Orszag sikeresen modositva.",
      country: updated,
    });
  } catch (error) {
    if (error.code === "DUPLICATE_COUNTRY") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Hiba tortent az orszag modositasa soran." });
  }
};

exports.createMeret = async (req, res) => {
  try {
    const meret = typeof req.body.meret === "string" ? req.body.meret.trim() : "";
    const szorzo = toPositiveNumber(req.body.szorzo);

    if (!meret || !szorzo) {
      return res.status(400).json({ message: "A meret es a pozitiv szorzo kotelezo." });
    }

    const created = await Zaszlo.addMeret({ meret, szorzo });
    return res.status(201).json({
      message: "Uj meret sikeresen rogzitve.",
      meret: created,
    });
  } catch (error) {
    if (error.code === "DUPLICATE_SIZE") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Hiba tortent a meret letrehozasakor." });
  }
};

exports.updateMeret = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    const meret = typeof req.body.meret === "string" ? req.body.meret.trim() : "";
    const szorzo = toPositiveNumber(req.body.szorzo);

    if (!id || !meret || !szorzo) {
      return res.status(400).json({ message: "Hianyzo vagy ervenytelen meret adat." });
    }

    const updated = await Zaszlo.updateMeret(id, { meret, szorzo });
    if (!updated) {
      return res.status(404).json({ message: "Nem talalhato ilyen meret." });
    }

    return res.json({
      message: "Meret sikeresen modositva.",
      meret: updated,
    });
  } catch (error) {
    if (error.code === "DUPLICATE_SIZE") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Hiba tortent a meret modositasa soran." });
  }
};

exports.createAnyag = async (req, res) => {
  try {
    const anyag = typeof req.body.anyag === "string" ? req.body.anyag.trim() : "";
    const szorzo = toPositiveNumber(req.body.szorzo);

    if (!anyag || !szorzo) {
      return res.status(400).json({ message: "Az anyag es a pozitiv szorzo kotelezo." });
    }

    const created = await Zaszlo.addAnyag({ anyag, szorzo });
    return res.status(201).json({
      message: "Uj anyag sikeresen rogzitve.",
      anyag: created,
    });
  } catch (error) {
    if (error.code === "DUPLICATE_MATERIAL") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Hiba tortent az anyag letrehozasakor." });
  }
};

exports.updateAnyag = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    const anyag = typeof req.body.anyag === "string" ? req.body.anyag.trim() : "";
    const szorzo = toPositiveNumber(req.body.szorzo);

    if (!id || !anyag || !szorzo) {
      return res.status(400).json({ message: "Hianyzo vagy ervenytelen anyag adat." });
    }

    const updated = await Zaszlo.updateAnyag(id, { anyag, szorzo });
    if (!updated) {
      return res.status(404).json({ message: "Nem talalhato ilyen anyag." });
    }

    return res.json({
      message: "Anyag sikeresen modositva.",
      anyag: updated,
    });
  } catch (error) {
    if (error.code === "DUPLICATE_MATERIAL") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Hiba tortent az anyag modositasa soran." });
  }
};

exports.createBulk = async (req, res) => {
  try {
    const orszag = typeof req.body.orszag === "string" ? req.body.orszag.trim() : "";
    const kontinens = typeof req.body.kontinens === "string" ? req.body.kontinens.trim() : "";
    const kontinensId = toInt(req.body.kontinensId);
    const meretIds = parseIdArray(req.body.meretIds);
    const anyagIds = parseIdArray(req.body.anyagIds);

    if (!orszag || !meretIds.length || !anyagIds.length) {
      return res.status(400).json({
        message: "Orszag, legalabb egy meret es legalabb egy anyag kotelezo.",
      });
    }

    const result = await Zaszlo.createBulk({
      orszag,
      kontinens,
      kontinensId,
      meretIds,
      anyagIds,
    });

    const statusCode = result.createdCount > 0 ? 201 : 200;
    return res.status(statusCode).json({
      message:
        result.createdCount > 0
          ? "Tomeges variacio letrehozas sikeres."
          : "Nem jott letre uj variacio, minden kombinacio mar letezett.",
      ...result,
    });
  } catch (error) {
    if (error.code === "INVALID_INPUT") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Hiba tortent a tomeges letrehozas soran." });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Ervenytelen azonosito." });
    }

    const eredmeny = await Zaszlo.delete(id);
    if (!eredmeny) {
      return res.status(404).json({ message: "A torolni kivant zaszlo nem talalhato." });
    }

    return res.json({ message: "Zaszlo sikeresen torolve." });
  } catch (error) {
    return res.status(500).json({ message: "Hiba tortent a zaszlo torlese soran." });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Ervenytelen azonosito." });
    }

    const zaszlo = await Zaszlo.getById(id);
    if (!zaszlo) {
      return res.status(404).json({ message: "A kivalasztott zaszlo nem talalhato." });
    }
    return res.json(zaszlo);
  } catch (error) {
    return res.status(500).json({ message: "Hiba tortent a zaszlo lekerese soran." });
  }
};

exports.filterZaszlok = async (req, res) => {
  try {
    const { meret, anyag, kontinens, orszag } = req.query;
    const zaszlok = await Zaszlo.filter(meret, anyag, kontinens, orszag);
    return res.json(zaszlok);
  } catch (error) {
    return res.status(500).json({ message: "Hiba tortent a zaszlok szurese soran." });
  }
};

exports.create = async (req, res) => {
  try {
    const { orszag, meretId, anyagId, kontinens, kontinensId } = req.body;
    const result = await Zaszlo.create({
      orszag,
      meretId,
      anyagId,
      kontinens,
      kontinensId,
    });

    return res.status(201).json({
      message: "Zaszlo sikeresen hozzaadva.",
      id: result.insertId,
      orszagId: result.orszagId,
    });
  } catch (error) {
    if (error.code === "INVALID_INPUT") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === "DUPLICATE_VARIANT") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Hiba tortent a zaszlo letrehozasakor." });
  }
};
