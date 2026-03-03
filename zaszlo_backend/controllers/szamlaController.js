const Szamla = require("../models/szamlaModel");

const toInt = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

exports.createSzamla = async (req, res) => {
  try {
    const { fizetesiMod, fizetesiModId, kosar } = req.body;
    const vevoIdFromToken = req.user.id;

    if (!vevoIdFromToken) {
      return res.status(401).json({ message: "Azonositasi hiba!" });
    }

    const eredmeny = await Szamla.create(
      vevoIdFromToken,
      { fizetesiMod, fizetesiModId },
      kosar
    );

    return res.status(201).json(eredmeny);
  } catch (err) {
    if (err.code === "INVALID_PAYMENT_METHOD" || err.code === "MISSING_PAYMENT_METHOD") {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: "Hiba tortent", error: err.message });
  }
};

exports.getSajatSzamlak = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Azonositasi hiba! Kerjuk, jelentkezz be ujra." });
    }

    const vevoIdFromToken = req.user.id;
    const szamlak = await Szamla.getByUserId(vevoIdFromToken);
    return res.status(200).json(szamlak);
  } catch (err) {
    console.error("Hiba a szamlak lekeresekor:", err);
    return res.status(500).json({
      message: "Hiba tortent a szamlak lekeresekor",
      error: err.message,
    });
  }
};

exports.getFizetesiModok = async (_req, res) => {
  try {
    const fizetesiModok = await Szamla.listPaymentMethods();
    return res.json(fizetesiModok);
  } catch (error) {
    return res.status(500).json({ message: "Hiba tortent a fizetesi modok lekerdezese kozben." });
  }
};

exports.adminGetSzamlak = async (_req, res) => {
  try {
    const szamlak = await Szamla.getAllForAdmin();
    return res.json(szamlak);
  } catch (error) {
    return res.status(500).json({ message: "Hiba tortent az admin szamlak lekerdezese kozben." });
  }
};

exports.adminDeleteSzamla = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Ervenytelen szamla azonosito." });
    }

    const result = await Szamla.deleteByIdForAdmin(id);
    if (!result) {
      return res.status(404).json({ message: "A szamla nem talalhato." });
    }

    return res.json({
      message: "Szamla sikeresen torolve.",
      ...result,
    });
  } catch (error) {
    return res.status(500).json({ message: "Hiba tortent a szamla torlese kozben." });
  }
};

exports.adminCreateFizetesiMod = async (req, res) => {
  try {
    const created = await Szamla.createPaymentMethod(req.body.nev);
    return res.status(201).json({
      message: "Fizetesi mod sikeresen letrehozva.",
      fizetesiMod: created,
    });
  } catch (error) {
    if (error.code === "INVALID_INPUT") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === "DUPLICATE_PAYMENT_METHOD") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Hiba tortent a fizetesi mod letrehozasakor." });
  }
};

exports.adminDeleteFizetesiMod = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Ervenytelen fizetesi mod azonosito." });
    }

    const deleted = await Szamla.deletePaymentMethod(id);
    if (!deleted) {
      return res.status(404).json({ message: "A fizetesi mod nem talalhato." });
    }

    return res.json({
      message: "Fizetesi mod sikeresen torolve.",
      fizetesiMod: deleted,
    });
  } catch (error) {
    if (error.code === "PAYMENT_METHOD_IN_USE") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Hiba tortent a fizetesi mod torlese kozben." });
  }
};
