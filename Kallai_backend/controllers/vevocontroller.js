const bcrypt = require("bcrypt");
const Felhasznalo = require("../models/vevoModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

//1. regisztráció
exports.register = async (req, res, next) => {
  try {
    const { nev, email, jelszo, jogosultsag } = req.body;

    // email létezik-e?
    const userExists = await Felhasznalo.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "A megadott email már foglalt." });
    }

    // jelszó hash
    const hashedPassword = await bcrypt.hash(jelszo, 10);

    // felhasználó mentése
    await Felhasznalo.register({
      nev,
      email,
      jelszo: hashedPassword,
      jogosultsag: 'user',
    });

    // válasz
    res.status(201).json({ message: "Sikeres regisztráció!" });

  } catch (error) {
    next(error);
  }
};

//2. bejelentkezés
exports.login = async (req, res, next) => {
  try {
    const { email, jelszo } = req.body;

    // Felhasználó lekérése
    const user = await Felhasznalo.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Hibás email vagy jelszó." });
    }

    // Jelszó ellenőrzés
    const isMatch = await bcrypt.compare(jelszo, user.jelszo);
    if (!isMatch) {
      return res.status(400).json({ message: "Hibás email vagy jelszó." });
    }

    // Access token (rövid élettartamú)
    const accessToken = jwt.sign(
      { id: user.id, nev: user.nev, email: user.email, szerep: user.jogosultsag },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN } // pl. 1h
    );

    // Refresh token (hosszú élettartamú JWT)
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.REFRESH_JWT_SECRET,
      { expiresIn: process.env.REFRESH_EXPIRES_IN } // pl. 7d
    );

    // Refresh token HTTP-only cookie-ban
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS élesben
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 nap (összhangban a JWT lejárattal)
    });

    // Visszaküldjük az access tokent JSON-ben
    res.json({
      message: "Sikeres bejelentkezés!",
      accessToken
    });

  } catch (error) {
    next(error);
  }
};

//3. refresh token kezelése
exports.refreshToken = (req, res) => {
  try {
    // Cookie kiolvasása
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Nincs refresh token." });
    }

    // Refresh token ellenőrzése
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);

    // Új access token generálása
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email},
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Küldjük vissza az új access tokent
    return res.json({
      accessToken: newAccessToken,
    });

  } catch (error) {
    return res.status(403).json({ message: "Érvénytelen vagy lejárt refresh token." });
  }
};

//4. védett útvonal - profil lekérése
exports.profil = async (req, res, next) => {
  try {
    const user = await Felhasznalo.getById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Felhasználó nem található." });
    }

    res.json({ user });

  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  try {
    // Töröljük a refreshToken cookie-t
    // Fontos: ugyanazokkal a beállításokkal kell törölni, ahogy létrehoztuk (kivéve a maxAge)
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production"
    });

    return res.status(200).json({ message: "Sikeres kijelentkezés!" });
  } catch (error) {
    return res.status(500).json({ message: "Hiba a kijelentkezéskor." });
  }
};