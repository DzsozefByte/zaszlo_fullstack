const db = require('../config/db');

class Anyagok {
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM anyagok');
      return rows;
    } catch (err) {
      throw err; 
    }
  }
}

module.exports = Anyagok;