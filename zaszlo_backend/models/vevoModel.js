const db = require("../config/db");

const LAKCIM_MAX_LENGTH = 150;

const normalizeNullableString = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized || null;
};

const buildLakcim = ({ iranyitoszam, varos, utca }) => {
  const addressParts = [
    normalizeNullableString(iranyitoszam),
    normalizeNullableString(varos),
    normalizeNullableString(utca),
  ].filter(Boolean);

  if (addressParts.length === 0) {
    return null;
  }

  return addressParts.join(" ").slice(0, LAKCIM_MAX_LENGTH);
};

class Vevo {
  static async register(userData) {
    const { nev, email, jelszo, telefonszam, iranyitoszam, varos, utca, adoszam } = userData;
    const telefonszamValue = normalizeNullableString(telefonszam);
    const iranyitoszamText = normalizeNullableString(iranyitoszam);
    const iranyitoszamValue = iranyitoszamText ? Number(iranyitoszamText) : null;
    const varosValue = normalizeNullableString(varos);
    const utcaValue = normalizeNullableString(utca);
    const adoszamValue = normalizeNullableString(adoszam);
    const lakcim = buildLakcim({ iranyitoszam: iranyitoszamText, varos: varosValue, utca: utcaValue });

    const [result] = await db.query(
      "INSERT INTO vevo (nev, lakcim, email, jelszo, jogosultsag, telefonszam, iranyitoszam, varos, utca, adoszam) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [nev, lakcim, email, jelszo, "user", telefonszamValue, iranyitoszamValue, varosValue, utcaValue, adoszamValue]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM vevo WHERE email = ?", [email]);
    return rows[0];
  }

  static async getById(id) {
    const [rows] = await db.query(
      "SELECT id, nev, email, jogosultsag, telefonszam, iranyitoszam, varos, utca, adoszam FROM vevo WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async updateProfile(id, profileData) {
    const { nev, telefonszam, iranyitoszam, varos, utca, adoszam } = profileData;
    const telefonszamValue = normalizeNullableString(telefonszam);
    const iranyitoszamText = normalizeNullableString(iranyitoszam);
    const iranyitoszamValue = iranyitoszamText ? Number(iranyitoszamText) : null;
    const varosValue = normalizeNullableString(varos);
    const utcaValue = normalizeNullableString(utca);
    const adoszamValue = normalizeNullableString(adoszam);
    const lakcim = buildLakcim({ iranyitoszam: iranyitoszamText, varos: varosValue, utca: utcaValue });

    await db.query(
      "UPDATE vevo SET nev = ?, lakcim = ?, telefonszam = ?, iranyitoszam = ?, varos = ?, utca = ?, adoszam = ? WHERE id = ?",
      [nev, lakcim, telefonszamValue, iranyitoszamValue, varosValue, utcaValue, adoszamValue, id]
    );

    return this.getById(id);
  }

  static async getAllForAdmin() {
    const [rows] = await db.query(
      "SELECT id, nev, email, jogosultsag, telefonszam, iranyitoszam, varos, utca, adoszam FROM vevo ORDER BY id DESC"
    );
    return rows;
  }

  static async updateRole(id, jogosultsag) {
    await db.query("UPDATE vevo SET jogosultsag = ? WHERE id = ?", [jogosultsag, id]);
    return this.getById(id);
  }

  static async deleteById(id) {
    const [result] = await db.query("DELETE FROM vevo WHERE id = ?", [id]);
    return result.affectedRows;
  }

  static async countAdmins() {
    const [rows] = await db.query(
      "SELECT COUNT(*) AS count FROM vevo WHERE jogosultsag = 'admin'"
    );
    return rows[0]?.count || 0;
  }
}

module.exports = Vevo;
