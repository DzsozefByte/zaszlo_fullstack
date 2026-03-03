const bcrypt = require("bcrypt");
const Felhasznalo = require("../models/vevoModel");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  try {
    const { nev, email, jelszo, telefonszam, iranyitoszam, varos, utca } = req.body;

    if (!nev || !email || !jelszo) {
      return res.status(400).json({ message: "A nev, email es jelszo kotelezo!" });
    }

    const userExists = await Felhasznalo.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "Ez az email mar foglalt." });
    }

    const hashedPassword = await bcrypt.hash(jelszo, 10);

    await Felhasznalo.register({
      nev,
      email,
      telefonszam,
      iranyitoszam,
      varos,
      utca,
      jelszo: hashedPassword,
    });

    res.status(201).json({ message: "Sikeres regisztracio!" });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, jelszo } = req.body;

    if (!email || !jelszo) {
      return res.status(400).json({ message: "Email es jelszo megadasa kotelezo!" });
    }

    const user = await Felhasznalo.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Hibas email vagy jelszo." });
    }

    const isMatch = await bcrypt.compare(jelszo, user.jelszo);
    if (!isMatch) {
      return res.status(400).json({ message: "Hibas email vagy jelszo." });
    }

    const accessToken = jwt.sign(
      { id: user.id, nev: user.nev, email: user.email, szerep: user.jogosultsag },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.REFRESH_JWT_SECRET,
      { expiresIn: process.env.REFRESH_EXPIRES_IN || "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Sikeres bejelentkezes!",
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Nincs refresh token." });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
    const user = await Felhasznalo.getById(decoded.id);

    if (!user) {
      return res.status(403).json({ message: "Felhasznalo nem talalhato." });
    }

    const newAccessToken = jwt.sign(
      { id: user.id, nev: user.nev, email: user.email, szerep: user.jogosultsag },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: "Ervenytelen vagy lejart refresh token." });
  }
};

exports.profil = async (req, res, next) => {
  try {
    const user = await Felhasznalo.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Felhasznalo nem talalhato." });
    }

    return res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfil = async (req, res, next) => {
  try {
    const nev = typeof req.body.nev === "string" ? req.body.nev.trim() : "";
    const telefonszam = typeof req.body.telefonszam === "string" ? req.body.telefonszam.trim() : "";
    const iranyitoszam = typeof req.body.iranyitoszam === "string" ? req.body.iranyitoszam.trim() : "";
    const varos = typeof req.body.varos === "string" ? req.body.varos.trim() : "";
    const utca = typeof req.body.utca === "string" ? req.body.utca.trim() : "";

    if (!nev) {
      return res.status(400).json({ message: "A nev megadasa kotelezo." });
    }

    const user = await Felhasznalo.updateProfile(req.user.id, {
      nev,
      telefonszam,
      iranyitoszam,
      varos,
      utca,
    });

    return res.json({
      message: "Profil adatok sikeresen mentve.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res.status(200).json({ message: "Sikeres kijelentkezes!" });
};
