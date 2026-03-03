const db = require("../config/db");

class Vevo {
  static async register(userData) {
    const { nev, email, jelszo, telefonszam, iranyitoszam, varos, utca, adoszam } = userData;
    const [result] = await db.query(
      "INSERT INTO vevo (nev, email, jelszo, jogosultsag, telefonszam, iranyitoszam, varos, utca, adoszam) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [nev, email, jelszo, "user", telefonszam || null, iranyitoszam || null, varos || null, utca || null, adoszam || null]
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
    const iranyitoszamValue = iranyitoszam ? Number(iranyitoszam) : null;

    await db.query(
      "UPDATE vevo SET nev = ?, telefonszam = ?, iranyitoszam = ?, varos = ?, utca = ?, adoszam = ? WHERE id = ?",
      [nev, telefonszam || null, iranyitoszamValue, varos || null, utca || null, adoszam || null, id]
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
