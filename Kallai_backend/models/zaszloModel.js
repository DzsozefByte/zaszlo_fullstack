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

static async getById(id) {
  try {
    const [rows] = await db.query(`
      SELECT 
        z.id, 
        o.orszag AS orszag, 
        m.meret AS meret, 
        a.anyag AS anyag
      FROM zaszlok z
      JOIN orszagok o ON z.orszagId = o.id
      JOIN meretek m ON z.meret = m.id
      JOIN anyagok a ON z.anyag = a.id
      WHERE z.id = ?
    `, [id]);
    return rows[0];
  } catch (err) {
    throw err;
  }
}




  

};




module.exports = Zaszlok;
