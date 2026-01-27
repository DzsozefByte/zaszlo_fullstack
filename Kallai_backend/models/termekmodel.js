const db = require('../config/db');

class Termekek {
  static async getAll() {
    try {
      const result = await db.query('SELECT * FROM termekek');
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Termekek;