const db = require('../config/db');

class Zaszlok {
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM view1');
      return rows;
    } catch (err) {
      throw err; // hibát a controller fogja kezelni
    }
  }
}

module.exports = Zaszlok;
