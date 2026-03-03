const db = require("../config/db");

class Zaszlok {
  static async getAll() {
    const [rows] = await db.query("SELECT * FROM 193orszag");
    return rows;
  }

  static async getAdminList() {
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
  }

  static async getAdminMeta() {
    const [meretek] = await db.query(
      "SELECT id, meret, szorzo FROM meretek ORDER BY id ASC"
    );
    const [anyagok] = await db.query(
      "SELECT id, anyag, szorzo FROM anyagok ORDER BY id ASC"
    );
    const [kontinensek] = await db.query(
      "SELECT id, kontinens FROM kontinensek ORDER BY kontinens ASC"
    );

    return { meretek, anyagok, kontinensek };
  }

  static async getKontinensIdByName(kontinens) {
    if (!kontinens || typeof kontinens !== "string") {
      return null;
    }

    const [rows] = await db.query(
      "SELECT id FROM kontinensek WHERE LOWER(kontinens) = LOWER(?) LIMIT 1",
      [kontinens.trim()]
    );
    return rows[0]?.id || null;
  }

  static async updateCountry(orszagId, data) {
    const { orszag, kontinensId } = data;

    const [target] = await db.query("SELECT id FROM orszagok WHERE id = ?", [orszagId]);
    if (!target.length) {
      return null;
    }

    const [duplicate] = await db.query(
      "SELECT id FROM orszagok WHERE LOWER(orszag) = LOWER(?) AND id <> ? LIMIT 1",
      [orszag, orszagId]
    );
    if (duplicate.length) {
      const error = new Error("Ilyen orszag mar letezik.");
      error.code = "DUPLICATE_COUNTRY";
      throw error;
    }

    await db.query("UPDATE orszagok SET orszag = ?, kont_Id = ? WHERE id = ?", [
      orszag,
      kontinensId,
      orszagId,
    ]);

    const [rows] = await db.query(
      `
      SELECT o.id, o.orszag, o.kont_Id AS kontinensId, k.kontinens
      FROM orszagok o
      JOIN kontinensek k ON o.kont_Id = k.id
      WHERE o.id = ?
      `,
      [orszagId]
    );

    return rows[0];
  }

  static async addMeret(data) {
    const { meret, szorzo } = data;

    const [duplicate] = await db.query(
      "SELECT id FROM meretek WHERE LOWER(meret) = LOWER(?) LIMIT 1",
      [meret]
    );
    if (duplicate.length) {
      const error = new Error("Ilyen meret mar letezik.");
      error.code = "DUPLICATE_SIZE";
      throw error;
    }

    const [insertResult] = await db.query(
      "INSERT INTO meretek (meret, szorzo) VALUES (?, ?)",
      [meret, szorzo]
    );

    const [rows] = await db.query(
      "SELECT id, meret, szorzo FROM meretek WHERE id = ?",
      [insertResult.insertId]
    );
    return rows[0];
  }

  static async addAnyag(data) {
    const { anyag, szorzo } = data;

    const [duplicate] = await db.query(
      "SELECT id FROM anyagok WHERE LOWER(anyag) = LOWER(?) LIMIT 1",
      [anyag]
    );
    if (duplicate.length) {
      const error = new Error("Ilyen anyag mar letezik.");
      error.code = "DUPLICATE_MATERIAL";
      throw error;
    }

    const [insertResult] = await db.query(
      "INSERT INTO anyagok (anyag, szorzo) VALUES (?, ?)",
      [anyag, szorzo]
    );

    const [rows] = await db.query(
      "SELECT id, anyag, szorzo FROM anyagok WHERE id = ?",
      [insertResult.insertId]
    );
    return rows[0];
  }

  static async delete(id) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [rows] = await connection.query("SELECT orszagId FROM zaszlok WHERE id = ?", [id]);

      if (rows.length === 0) {
        await connection.rollback();
        return 0;
      }

      const orszagId = rows[0].orszagId;
      const [deleteResult] = await connection.query("DELETE FROM zaszlok WHERE id = ?", [id]);

      const [remaining] = await connection.query(
        "SELECT COUNT(*) AS count FROM zaszlok WHERE orszagId = ?",
        [orszagId]
      );

      if (remaining[0].count === 0) {
        await connection.query("DELETE FROM orszagok WHERE id = ?", [orszagId]);
      }

      await connection.commit();
      return deleteResult.affectedRows;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getById(id) {
    const [rows] = await db.query(
      `
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
      `,
      [id]
    );
    return rows[0];
  }

  static async filter(meret, anyag, kontinens, orszag) {
    const feltetelek = [];
    const talalt = [];

    if (meret) {
      feltetelek.push("meret LIKE ?");
      talalt.push(`%${meret}%`);
    }
    if (anyag) {
      feltetelek.push("anyag LIKE ?");
      talalt.push(`%${anyag}%`);
    }
    if (kontinens) {
      feltetelek.push("kontinens LIKE ?");
      talalt.push(`%${kontinens}%`);
    }
    if (orszag) {
      feltetelek.push("orszag LIKE ?");
      talalt.push(`%${orszag}%`);
    }

    const whereClause = feltetelek.length ? `WHERE ${feltetelek.join(" AND ")}` : "";
    const [rows] = await db.query(`SELECT * FROM getAll ${whereClause}`, talalt);
    return rows;
  }

  static async create(data) {
    const orszag = typeof data.orszag === "string" ? data.orszag.trim() : "";
    const meretId = Number(data.meretId);
    const anyagId = Number(data.anyagId);
    const kontinens = typeof data.kontinens === "string" ? data.kontinens.trim() : "";

    if (!orszag || !Number.isInteger(meretId) || !Number.isInteger(anyagId) || !kontinens) {
      const error = new Error("Hibas vagy hianyzo adat.");
      error.code = "INVALID_INPUT";
      throw error;
    }

    const kontinensId = (await this.getKontinensIdByName(kontinens)) || 2;

    const [existingOrszag] = await db.query(
      "SELECT id, kont_Id FROM orszagok WHERE LOWER(orszag) = LOWER(?) LIMIT 1",
      [orszag]
    );

    let orszagId;
    if (existingOrszag.length === 0) {
      const [newOrszag] = await db.query(
        "INSERT INTO orszagok (orszag, kont_Id) VALUES (?, ?)",
        [orszag, kontinensId]
      );
      orszagId = newOrszag.insertId;
    } else {
      orszagId = existingOrszag[0].id;
      if (existingOrszag[0].kont_Id !== kontinensId) {
        await db.query("UPDATE orszagok SET kont_Id = ? WHERE id = ?", [kontinensId, orszagId]);
      }
    }

    const [existingVariant] = await db.query(
      "SELECT id FROM zaszlok WHERE meret = ? AND anyag = ? AND orszagId = ? LIMIT 1",
      [meretId, anyagId, orszagId]
    );
    if (existingVariant.length) {
      const error = new Error("Ez a termekvariacio mar letezik.");
      error.code = "DUPLICATE_VARIANT";
      throw error;
    }

    const [result] = await db.query(
      "INSERT INTO zaszlok (meret, anyag, orszagId) VALUES (?, ?, ?)",
      [meretId, anyagId, orszagId]
    );

    return {
      insertId: result.insertId,
      orszagId,
    };
  }
}

module.exports = Zaszlok;
