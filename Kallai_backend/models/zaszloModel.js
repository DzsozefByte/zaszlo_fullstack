const db = require('../config/db');

class Zaszlok {
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM view3');
      return rows;
    } catch (err) {
      throw err; // hibát a controller fogja kezelni
    }
  }

  static async delete(id){
    await db.query('DELETE FROM kapcsolo_zaszlok WHERE LOWER(orszag) = LOWER(:orszag)', [id]);
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

static async filter(meret, anyag, kontinens, orszag) {
  try {
    const feltetelek = [];
    const talalt = [];

    if (meret) {
      feltetelek.push('meret LIKE ?');
      talalt.push(`%${meret}%`);
    }
    if (anyag) {
      feltetelek.push('anyag LIKE ?');
      talalt.push(`%${anyag}%`);
    }
    if (kontinens) {
      feltetelek.push('kontinens LIKE ?');
      talalt.push(`%${kontinens}%`);
    }
    if (orszag) {
      feltetelek.push('orszag LIKE ?');
      talalt.push(`%${orszag}%`);
    }

    const sikeres = feltetelek.length ? "where " + feltetelek.join(' AND ') : '';
    const [result] = await db.query(`SELECT * FROM getAll ${sikeres}`, talalt)
    return result
  }
  catch (err) {
    throw err;
  }

};
}

module.exports = Zaszlok;