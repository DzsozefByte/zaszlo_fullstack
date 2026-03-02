const db = require('../config/db');

class Vevo {
  // Regisztráció: új rekord beszúrása
static async register(userData) {
  const { nev, email, jelszo, telefonszam, iranyitoszam, varos, utca } = userData;
  const [result] = await db.query(
    'INSERT INTO vevo (nev, email, jelszo, jogosultsag, telefonszam, iranyitoszam, varos, utca) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [nev, email, jelszo, 'user', telefonszam, iranyitoszam, varos, utca]
  );
  return result.insertId;
}

static async getById(id) {
  const [rows] = await db.query(
    'SELECT id, nev, email, jogosultsag, telefonszam, iranyitoszam, varos, utca FROM vevo WHERE id = ?',
    [id]
  );
  return rows[0];
}

  // Bejelentkezéshez: keresés email alapján
  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM vevo WHERE email = ?', [email]);
    return rows[0];
  }
  static async getById(id) {
  const [rows] = await db.query(
    'SELECT id, nev, email, jogosultsag FROM vevo WHERE id = ?',
    [id]
  );
  return rows[0];
}


}

module.exports = Vevo;