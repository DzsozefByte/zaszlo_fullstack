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
      ORDER BY o.orszag ASC, m.id ASC, a.id ASC
    `);
    return rows;
  }

  static async getAdminMeta() {
    const [meretek] = await db.query("SELECT id, meret, szorzo FROM meretek ORDER BY id ASC");
    const [anyagok] = await db.query("SELECT id, anyag, szorzo FROM anyagok ORDER BY id ASC");
    const [kontinensek] = await db.query(
      "SELECT id, kontinens FROM kontinensek ORDER BY kontinens ASC"
    );
    return { meretek, anyagok, kontinensek };
  }

  static normalizeIds(rawIds) {
    if (!Array.isArray(rawIds)) {
      return [];
    }
    return [...new Set(rawIds.map(Number).filter((id) => Number.isInteger(id) && id > 0))];
  }

  static async cleanupUnusedCountries(connection, orszagIds) {
    const uniqueIds = this.normalizeIds(orszagIds);
    if (!uniqueIds.length) {
      return 0;
    }

    const [unused] = await connection.query(
      `
      SELECT o.id
      FROM orszagok o
      LEFT JOIN zaszlok z ON z.orszagId = o.id
      WHERE o.id IN (?)
      GROUP BY o.id
      HAVING COUNT(z.id) = 0
      `,
      [uniqueIds]
    );

    if (!unused.length) {
      return 0;
    }

    const unusedIds = unused.map((item) => item.id);
    const [deleted] = await connection.query("DELETE FROM orszagok WHERE id IN (?)", [unusedIds]);
    return deleted.affectedRows;
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

  static async resolveOrCreateCountry(orszag, kontinensId) {
    const [existingOrszag] = await db.query(
      "SELECT id, kont_Id FROM orszagok WHERE LOWER(orszag) = LOWER(?) LIMIT 1",
      [orszag]
    );

    if (!existingOrszag.length) {
      const [newOrszag] = await db.query(
        "INSERT INTO orszagok (orszag, kont_Id) VALUES (?, ?)",
        [orszag, kontinensId]
      );
      return newOrszag.insertId;
    }

    const orszagId = existingOrszag[0].id;
    if (existingOrszag[0].kont_Id !== kontinensId) {
      await db.query("UPDATE orszagok SET kont_Id = ? WHERE id = ?", [kontinensId, orszagId]);
    }
    return orszagId;
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

    const [insertResult] = await db.query("INSERT INTO meretek (meret, szorzo) VALUES (?, ?)", [
      meret,
      szorzo,
    ]);

    const [rows] = await db.query("SELECT id, meret, szorzo FROM meretek WHERE id = ?", [
      insertResult.insertId,
    ]);
    return rows[0];
  }

  static async updateMeret(id, data) {
    const { meret, szorzo } = data;
    const [target] = await db.query("SELECT id FROM meretek WHERE id = ?", [id]);
    if (!target.length) {
      return null;
    }

    const [duplicate] = await db.query(
      "SELECT id FROM meretek WHERE LOWER(meret) = LOWER(?) AND id <> ? LIMIT 1",
      [meret, id]
    );
    if (duplicate.length) {
      const error = new Error("Ilyen meret mar letezik.");
      error.code = "DUPLICATE_SIZE";
      throw error;
    }

    await db.query("UPDATE meretek SET meret = ?, szorzo = ? WHERE id = ?", [meret, szorzo, id]);
    const [rows] = await db.query("SELECT id, meret, szorzo FROM meretek WHERE id = ?", [id]);
    return rows[0];
  }

  static async deleteMeret(id) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [target] = await connection.query("SELECT id FROM meretek WHERE id = ?", [id]);
      if (!target.length) {
        await connection.rollback();
        return null;
      }

      const [countryRows] = await connection.query(
        "SELECT DISTINCT orszagId FROM zaszlok WHERE meret = ?",
        [id]
      );

      const [deletedVariants] = await connection.query("DELETE FROM zaszlok WHERE meret = ?", [id]);
      const deletedCountries = await this.cleanupUnusedCountries(
        connection,
        countryRows.map((item) => item.orszagId)
      );

      const [deletedBase] = await connection.query("DELETE FROM meretek WHERE id = ?", [id]);

      await connection.commit();
      return {
        deletedBaseCount: deletedBase.affectedRows,
        deletedVariantCount: deletedVariants.affectedRows,
        deletedCountryCount: deletedCountries,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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

    const [insertResult] = await db.query("INSERT INTO anyagok (anyag, szorzo) VALUES (?, ?)", [
      anyag,
      szorzo,
    ]);

    const [rows] = await db.query("SELECT id, anyag, szorzo FROM anyagok WHERE id = ?", [
      insertResult.insertId,
    ]);
    return rows[0];
  }

  static async updateAnyag(id, data) {
    const { anyag, szorzo } = data;
    const [target] = await db.query("SELECT id FROM anyagok WHERE id = ?", [id]);
    if (!target.length) {
      return null;
    }

    const [duplicate] = await db.query(
      "SELECT id FROM anyagok WHERE LOWER(anyag) = LOWER(?) AND id <> ? LIMIT 1",
      [anyag, id]
    );
    if (duplicate.length) {
      const error = new Error("Ilyen anyag mar letezik.");
      error.code = "DUPLICATE_MATERIAL";
      throw error;
    }

    await db.query("UPDATE anyagok SET anyag = ?, szorzo = ? WHERE id = ?", [anyag, szorzo, id]);
    const [rows] = await db.query("SELECT id, anyag, szorzo FROM anyagok WHERE id = ?", [id]);
    return rows[0];
  }

  static async deleteAnyag(id) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [target] = await connection.query("SELECT id FROM anyagok WHERE id = ?", [id]);
      if (!target.length) {
        await connection.rollback();
        return null;
      }

      const [countryRows] = await connection.query(
        "SELECT DISTINCT orszagId FROM zaszlok WHERE anyag = ?",
        [id]
      );

      const [deletedVariants] = await connection.query("DELETE FROM zaszlok WHERE anyag = ?", [id]);
      const deletedCountries = await this.cleanupUnusedCountries(
        connection,
        countryRows.map((item) => item.orszagId)
      );

      const [deletedBase] = await connection.query("DELETE FROM anyagok WHERE id = ?", [id]);

      await connection.commit();
      return {
        deletedBaseCount: deletedBase.affectedRows,
        deletedVariantCount: deletedVariants.affectedRows,
        deletedCountryCount: deletedCountries,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async createBulk(data) {
    const orszag = typeof data.orszag === "string" ? data.orszag.trim() : "";
    const kontinens = typeof data.kontinens === "string" ? data.kontinens.trim() : "";
    const kontinensIdFromBody = Number(data.kontinensId);
    const meretIds = this.normalizeIds(data.meretIds);
    const anyagIds = this.normalizeIds(data.anyagIds);

    if (!orszag || !meretIds.length || !anyagIds.length) {
      const error = new Error("Hibas vagy hianyzo adat.");
      error.code = "INVALID_INPUT";
      throw error;
    }

    let kontinensId = Number.isInteger(kontinensIdFromBody) && kontinensIdFromBody > 0
      ? kontinensIdFromBody
      : null;
    if (!kontinensId) {
      kontinensId = (await this.getKontinensIdByName(kontinens)) || 2;
    }

    const orszagId = await this.resolveOrCreateCountry(orszag, kontinensId);
    const [existing] = await db.query(
      `
      SELECT meret, anyag
      FROM zaszlok
      WHERE orszagId = ?
        AND meret IN (?)
        AND anyag IN (?)
      `,
      [orszagId, meretIds, anyagIds]
    );

    const existingSet = new Set(existing.map((item) => `${item.meret}-${item.anyag}`));
    const values = [];
    for (const meretId of meretIds) {
      for (const anyagId of anyagIds) {
        const key = `${meretId}-${anyagId}`;
        if (!existingSet.has(key)) {
          values.push([meretId, anyagId, orszagId]);
        }
      }
    }

    let createdIds = [];
    if (values.length > 0) {
      const [result] = await db.query(
        "INSERT INTO zaszlok (meret, anyag, orszagId) VALUES ?",
        [values]
      );
      if (result.insertId && result.affectedRows) {
        createdIds = Array.from({ length: result.affectedRows }, (_, idx) => result.insertId + idx);
      }
    }

    return {
      orszagId,
      createdCount: values.length,
      skippedCount: meretIds.length * anyagIds.length - values.length,
      createdIds,
    };
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
      await this.cleanupUnusedCountries(connection, [orszagId]);

      await connection.commit();
      return deleteResult.affectedRows;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async deleteCountry(orszagId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [target] = await connection.query("SELECT id FROM orszagok WHERE id = ?", [orszagId]);
      if (!target.length) {
        await connection.rollback();
        return null;
      }

      const [deletedVariants] = await connection.query(
        "DELETE FROM zaszlok WHERE orszagId = ?",
        [orszagId]
      );
      const [deletedCountry] = await connection.query("DELETE FROM orszagok WHERE id = ?", [orszagId]);

      await connection.commit();
      return {
        deletedCountryCount: deletedCountry.affectedRows,
        deletedVariantCount: deletedVariants.affectedRows,
      };
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
        z.orszagId,
        o.orszag,
        m.meret,
        m.szorzo AS meret_szorzo,
        a.anyag,
        a.szorzo AS anyag_szorzo
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
    const talalatok = [];

    if (meret) {
      feltetelek.push("m.meret LIKE ?");
      talalatok.push(`%${meret}%`);
    }
    if (anyag) {
      feltetelek.push("a.anyag LIKE ?");
      talalatok.push(`%${anyag}%`);
    }
    if (kontinens) {
      feltetelek.push("k.kontinens LIKE ?");
      talalatok.push(`%${kontinens}%`);
    }
    if (orszag) {
      feltetelek.push("o.orszag LIKE ?");
      talalatok.push(`%${orszag}%`);
    }

    const whereClause = feltetelek.length ? `WHERE ${feltetelek.join(" AND ")}` : "";
    const [rows] = await db.query(
      `
      SELECT
        o.id AS id,
        o.id AS orszagId,
        z.id AS variantId,
        o.orszag,
        k.kontinens,
        m.id AS meretId,
        m.meret,
        m.szorzo AS meret_szorzo,
        a.id AS anyagId,
        a.anyag,
        a.szorzo AS anyag_szorzo
      FROM zaszlok z
      JOIN meretek m ON m.id = z.meret
      JOIN anyagok a ON a.id = z.anyag
      JOIN orszagok o ON o.id = z.orszagId
      JOIN kontinensek k ON k.id = o.kont_Id
      ${whereClause}
      ORDER BY o.orszag ASC, m.id ASC, a.id ASC
      `,
      talalatok
    );
    return rows;
  }

  static async create(data) {
    const result = await this.createBulk({
      orszag: data.orszag,
      kontinens: data.kontinens,
      kontinensId: data.kontinensId,
      meretIds: [Number(data.meretId)],
      anyagIds: [Number(data.anyagId)],
    });

    if (result.createdCount === 0) {
      const error = new Error("Ez a termekvariacio mar letezik.");
      error.code = "DUPLICATE_VARIANT";
      throw error;
    }

    return {
      insertId: result.createdIds[0],
      orszagId: result.orszagId,
      createdCount: result.createdCount,
      skippedCount: result.skippedCount,
    };
  }
}

module.exports = Zaszlok;
