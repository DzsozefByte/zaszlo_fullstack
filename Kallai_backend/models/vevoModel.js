const db = require('../config/db');

class Vevo {
  // Regisztráció: új rekord beszúrása
  static async register(userData) {
    const { nev, email, jelszo } = userData;
    // A többi mező (lakcim, adoszam) null marad alapértelmezetten
    const [result] = await db.query(
      'INSERT INTO vevo (nev, email, jelszo, jogosultsag) VALUES (?, ?, ?, ?)',
      [nev, email, jelszo, 'user']
    );
    return result.insertId;
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