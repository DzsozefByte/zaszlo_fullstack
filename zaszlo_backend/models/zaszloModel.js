const db = require('../config/db');

class Zaszlok {
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM view3');
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async getAdminList() {
    try {
      const [rows] = await db.query(`
        SELECT 
          z.id, 
          z.orszagId, 
          o.orszag, 
          k.kontinens,
          m.meret AS meret_nev,
          a.anyag AS anyag_nev
        FROM zaszlok z
        JOIN orszagok o ON z.orszagId = o.id
        JOIN kontinensek k ON o.kont_Id = k.id
        JOIN meretek m ON z.meret = m.id
        JOIN anyagok a ON z.anyag = a.id
        ORDER BY o.orszag ASC
      `);
      return rows;
    } catch (err) {
      throw err;
    }
  }

static async delete(id) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Megkeressük az orszagId-t, mielőtt törölnénk a zászlót
      const [rows] = await connection.query('SELECT orszagId FROM zaszlok WHERE id = ?', [id]);
      
      if (rows.length === 0) {
        await connection.rollback();
        return 0; // Nem található a zászló
      }
      
      const orszagId = rows[0].orszagId;

      // 2. Töröljük a konkrét zászlót (id alapján)
      const [deleteResult] = await connection.query('DELETE FROM zaszlok WHERE id = ?', [id]);

      // 3. Ellenőrizzük, maradt-e még BÁRMILYEN más zászló ehhez az országhoz
      // (Mert lehet, hogy van belőle más méret vagy anyag)
      const [remaining] = await connection.query(
        'SELECT COUNT(*) as count FROM zaszlok WHERE orszagId = ?', 
        [orszagId]
      );

      // 4. Ha ez volt az utolsó zászló ehhez az országhoz, töröljük az országot is
      if (remaining[0].count === 0) {
        await connection.query('DELETE FROM orszagok WHERE id = ?', [orszagId]);
        console.log(`Az ország (ID: ${orszagId}) is törölve lett, mert elfogytak a hozzá tartozó zászlók.`);
      }

      await connection.commit();
      return deleteResult.affectedRows;

    } catch (err) {
      await connection.rollback();
      console.error("Hiba a törlés során (Model):", err);
      throw err;
    } finally {
      connection.release();
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
      const [result] = await db.query(`SELECT * FROM getAll ${sikeres}`, talalt);
      return result;
    } catch (err) {
      throw err;
    }
  }

  static async create(data) {
    const { orszag, meretId, anyagId, kontinens } = data;
    
    // Kontinens név -> ID leképzés
    const kontinensMap = {
      "Afrika": 1, "Európa": 2, "Ázsia": 3, 
      "Észak-Amerika": 4, "Dél-Amerika": 5, 
      "Óceánia": 6, "Antarktisz": 7
    };
    const kId = kontinensMap[kontinens] || 2; 

    try {
      // 1. Ország ellenőrzése
      const [existingOrszag] = await db.query('SELECT id FROM orszagok WHERE LOWER(orszag) = LOWER(?)', [orszag]);
      
      let oId;
      if (existingOrszag.length === 0) {
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
      
      // FONTOS: Objektumot adunk vissza mindkét ID-val a képfeltöltéshez!
      return { 
        insertId: result.insertId, 
        orszagId: oId 
      };
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Zaszlok;