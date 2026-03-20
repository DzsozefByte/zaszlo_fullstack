const bcrypt = require("bcrypt");
const Felhasznalo = require("../models/vevoModel");
const jwt = require("jsonwebtoken");

const toInt = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const toPositiveIntOrDefault = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const toTrimmedString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
};

exports.register = async (req, res, next) => {
  try {
    const { nev, email, jelszo, telefonszam, iranyitoszam, varos, utca, adoszam } = req.body;

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
      adoszam,
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
    const nev = toTrimmedString(req.body.nev);
    const telefonszam = toTrimmedString(req.body.telefonszam);
    const iranyitoszam = toTrimmedString(req.body.iranyitoszam);
    const varos = toTrimmedString(req.body.varos);
    const utca = toTrimmedString(req.body.utca);
    const adoszam = toTrimmedString(req.body.adoszam);

    if (!nev) {
      return res.status(400).json({ message: "A nev megadasa kotelezo." });
    }

    if (iranyitoszam && !/^[0-9]+$/.test(iranyitoszam)) {
      return res.status(400).json({ message: "Az iranyitoszam csak szamokat tartalmazhat." });
    }

    const user = await Felhasznalo.updateProfile(req.user.id, {
      nev,
      telefonszam,
      iranyitoszam,
      varos,
      utca,
      adoszam,
    });

    return res.json({
      message: "Profil adatok sikeresen mentve.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.adminGetUsers = async (req, res, next) => {
  try {
    const limit = Math.min(toPositiveIntOrDefault(req.query.limit, 20), 100);
    const requestedPage = toPositiveIntOrDefault(req.query.page, 1);
    const total = await Felhasznalo.countAll();
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, totalPages);
    const offset = (page - 1) * limit;
    const users = await Felhasznalo.getPageForAdmin(limit, offset);

    return res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.adminUpdateUserRole = async (req, res, next) => {
  try {
    const userId = toInt(req.params.id);
    const jogosultsag = typeof req.body.jogosultsag === "string" ? req.body.jogosultsag.trim() : "";

    if (!userId || !["user", "admin"].includes(jogosultsag)) {
      return res.status(400).json({ message: "Ervenytelen felhasznalo vagy jogosultsag." });
    }

    const user = await Felhasznalo.getById(userId);
    if (!user) {
      return res.status(404).json({ message: "Felhasznalo nem talalhato." });
    }

    if (req.user.id === userId && jogosultsag !== "admin") {
      return res.status(400).json({ message: "A sajat admin jogosultsagodat nem veheted el." });
    }

    if (user.jogosultsag === "admin" && jogosultsag !== "admin") {
      const adminCount = await Felhasznalo.countAdmins();
      if (adminCount <= 1) {
        return res.status(400).json({ message: "Az utolso admin jogosultsaga nem modosithato userre." });
      }
    }

    const updatedUser = await Felhasznalo.updateRole(userId, jogosultsag);
    return res.json({
      message: "Felhasznalo jogosultsaga sikeresen modositva.",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

exports.adminDeleteUser = async (req, res, next) => {
  try {
    const userId = toInt(req.params.id);
    if (!userId) {
      return res.status(400).json({ message: "Ervenytelen felhasznalo azonosito." });
    }

    if (req.user.id === userId) {
      return res.status(400).json({ message: "Sajat fiok nem torolheto admin feluleten." });
    }

    const user = await Felhasznalo.getById(userId);
    if (!user) {
      return res.status(404).json({ message: "Felhasznalo nem talalhato." });
    }

    if (user.jogosultsag === "admin") {
      const adminCount = await Felhasznalo.countAdmins();
      if (adminCount <= 1) {
        return res.status(400).json({ message: "Az utolso admin nem torolheto." });
      }
    }

    await Felhasznalo.deleteById(userId);
    return res.json({ message: "Felhasznalo sikeresen torolve." });
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
