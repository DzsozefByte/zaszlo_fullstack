const db = require("../config/db");

class Szamla {
  static async resolveZaszloId(connection, item) {
    const variantId = Number(item.variantId);
    if (Number.isInteger(variantId) && variantId > 0) {
      return variantId;
    }

    const orszagId = Number(item.orszagId || item.id);
    if (
      Number.isInteger(orszagId) &&
      orszagId > 0 &&
      typeof item.meret === "string" &&
      typeof item.anyag === "string"
    ) {
      const [rows] = await connection.query(
        `
        SELECT z.id
        FROM zaszlok z
        JOIN meretek m ON m.id = z.meret
        JOIN anyagok a ON a.id = z.anyag
        WHERE z.orszagId = ? AND m.meret = ? AND a.anyag = ?
        LIMIT 1
        `,
        [orszagId, item.meret, item.anyag]
      );
      if (rows.length) {
        return rows[0].id;
      }
    }

    const fallbackId = Number(item.id);
    if (Number.isInteger(fallbackId) && fallbackId > 0) {
      return fallbackId;
    }

    throw new Error("Nem sikerult ervenyes zaszlo azonositohoz jutni.");
  }

  static async create(vevoId, fizetesiMod, kosar) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const ma = new Date().toISOString().split("T")[0];
      const szamlaszam = `SZ-${Date.now().toString().slice(-6)}`;

      const [header] = await connection.query(
        `
        INSERT INTO szamla (fizetesi_mod, teljesites_kelte, szamla_kelte, fizetesi_hatarido, vevo_id, szamlaszam)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [fizetesiMod === "kartya" ? 2 : 1, ma, ma, ma, vevoId, szamlaszam]
      );

      const ujSzamlaId = header.insertId;

      if (Array.isArray(kosar) && kosar.length > 0) {
        const tetelAdatok = [];
        for (const item of kosar) {
          const zaszloId = await this.resolveZaszloId(connection, item);
          tetelAdatok.push([
            ujSzamlaId,
            zaszloId,
            item.meret,
            item.anyag,
            item.db,
            item.ar,
          ]);
        }

        await connection.query(
          `
          INSERT INTO rendeles_reszletek (szamla_id, zaszlo_id, meret, anyag, mennyiseg, egyseg_ar)
          VALUES ?
          `,
          [tetelAdatok]
        );
      }

      await connection.commit();
      return { success: true, szamlaszam };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async getByUserId(vevoId) {
    const [rows] = await db.query(
      "SELECT * FROM szamla WHERE vevo_id = ? ORDER BY szamla_kelte DESC",
      [vevoId]
    );
    return rows;
  }
}

module.exports = Szamla;
