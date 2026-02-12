const bcrypt = require("bcrypt");
const Felhasznalo = require("../models/vevoModel");
const jwt = require("jsonwebtoken");

// 1. Regisztráció
exports.register = async (req, res, next) => {
  try {
    const { nev, email, jelszo } = req.body;

    // Ellenőrizzük, hogy minden adat megjött-e
    if (!nev || !email || !jelszo) {
      return res.status(400).json({ message: "Hiányzó adatok! (név, email vagy jelszó)" });
    }

    // Email létezik-e?
    const userExists = await Felhasznalo.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "A megadott email már foglalt." });
    }

    // Jelszó hash
    const hashedPassword = await bcrypt.hash(jelszo, 10);

    // Felhasználó mentése
    await Felhasznalo.register({
      nev,
      email,
      jelszo: hashedPassword,
      jogosultsag: 'user',
    });

    res.status(201).json({ message: "Sikeres regisztráció!" });

  } catch (error) {
    console.error("Regisztrációs hiba részletei:", error);
    res.status(500).json({ message: "Hiba a regisztráció során az adatbázisban." });
  }
};

// 2. Bejelentkezés
exports.login = async (req, res, next) => {
  try {
    const { email, jelszo } = req.body;

    if (!email || !jelszo) {
      return res.status(400).json({ message: "Email és jelszó megadása kötelező!" });
    }

    const user = await Felhasznalo.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Hibás email vagy jelszó." });
    }

    const isMatch = await bcrypt.compare(jelszo, user.jelszo);
    if (!isMatch) {
      return res.status(400).json({ message: "Hibás email vagy jelszó." });
    }

    const accessToken = jwt.sign(
      { id: user.id, nev: user.nev, email: user.email, szerep: user.jogosultsag },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.REFRESH_JWT_SECRET,
      { expiresIn: process.env.REFRESH_EXPIRES_IN || '7d' }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax", // Jobb kompatibilitás localhost-on
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: "Sikeres bejelentkezés!",
      accessToken
    });

  } catch (error) {
    next(error);
  }
};

// 3. Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Nincs refresh token." });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
    const user = await Felhasznalo.getById(decoded.id);
    
    if (!user) return res.status(403).json({ message: "Felhasználó nem található." });

    const newAccessToken = jwt.sign(
      { id: user.id, nev: user.nev, email: user.email, szerep: user.jogosultsag },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: "Érvénytelen vagy lejárt refresh token." });
  }
};

// 4. Profil lekérése
exports.profil = async (req, res, next) => {
  try {
    const user = await Felhasznalo.getById(req.user.id);
    if (!user) return res.status(404).json({ message: "Felhasználó nem található." });
    
    // Ne küldjük vissza a jelszót a profilban
    delete user.jelszo;
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// 5. Kijelentkezés
exports.logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production"
  });
  return res.status(200).json({ message: "Sikeres kijelentkezés!" });
};