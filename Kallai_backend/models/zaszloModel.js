const db = require('../config/db');

class Zaszlok {
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM getAll');
      return rows;
    } catch (err) {
      throw err; // hibát a controller fogja kezelni
    }
  }

  static async delete(id){
    await db.query('DELETE FROM kapcsolo_zaszlok WHERE zaszlo_id = ?', [id]);
    const [result] = await db.query('DELETE FROM zaszlok WHERE id = ?', [id]);
    return result.affectedRows;
  }  


};




module.exports = Zaszlok;
