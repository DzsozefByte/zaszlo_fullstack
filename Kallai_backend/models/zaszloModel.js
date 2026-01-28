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

  static async getAdminList() {
  try {
    const [rows] = await db.query(`
      SELECT 
        z.id AS id, 
        o.orszag AS orszag, 
        k.kontinens AS kontinens
      FROM zaszlok z
      JOIN orszagok o ON z.orszagId = o.id
      JOIN kontinensek k ON o.kont_Id = k.id
      ORDER BY z.id DESC
    `);
    return rows;
  } catch (err) {
    throw err;
  }
}

static async delete(id) {
  try {
    // 1. Először a kapcsolótáblából (ha létezik ilyen nálad) töröljük a hivatkozást
    // Megjegyzés: Ha a dbForge-ban látott 'zaszlok' tábláról van szó, 
    // ott nincs külön kapcsolótábla, csak maga a 'zaszlok' tábla.
    // Ha van 'kapcsolo_zaszlok' táblád, akkor ott az ID alapján törölj:
    // await db.query('DELETE FROM kapcsolo_zaszlok WHERE zaszloId = ?', [id]);

    // 2. Törlés a fő zaszlok táblából
    const [result] = await db.query('DELETE FROM zaszlok WHERE id = ?', [id]);
    
    
    return result.affectedRows;
  } catch (err) {
    console.error("Hiba a törlés során (Model):", err);
    throw err;
  }
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

static async create(data) {
  const { orszag, meretId, anyagId, kontinens } = data;
  
  // Kontinens név -> ID leképzés a te listád alapján
  const kontinensMap = {
    "Afrika": 1, "Európa": 2, "Ázsia": 3, 
    "Észak-Amerika": 4, "Dél-Amerika": 5, 
    "Óceánia": 6, "Antarktisz": 7
  };
  const kId = kontinensMap[kontinens] || 2; // Alapértelmezett: Európa (2)

  try {
    // 1. Ország ellenőrzése és beszúrása a helyes kont_Id-val
    const [existingOrszag] = await db.query('SELECT id FROM orszagok WHERE LOWER(orszag) = LOWER(?)', [orszag]);
    
    let oId;
    if (existingOrszag.length === 0) {
      // Itt adjuk hozzá a kont_Id-t!
      const [newOrszag] = await db.query('INSERT INTO orszagok (orszag, kont_Id) VALUES (?, ?)', [orszag, kId]);
      oId = newOrszag.insertId;
    } else {
      oId = existingOrszag[0].id;
    }

    // 2. Zászló rögzítése
    const [result] = await db.query(
      'INSERT INTO zaszlok (meret, anyag, orszagId) VALUES (?, ?, ?)',
      [meretId, anyagId, oId]
    );
    
    return result.insertId;
  } catch (err) {
    throw err;
  }
}

static async getAdminList() {
  try {
    // Ez a lekérdezés nem csoportosít, így minden egyes zászlót külön sorban látsz majd az Admin felületen
    const [rows] = await db.query(`
      SELECT 
        z.id AS id, 
        o.orszag AS orszag, 
        k.kontinens AS kontinens
      FROM zaszlok z
      JOIN orszagok o ON z.orszagId = o.id
      JOIN kontinensek k ON o.kont_Id = k.id
      ORDER BY z.id DESC
    `);
    return rows;
  } catch (err) {
    throw err;
  }
}
}

module.exports = Zaszlok;