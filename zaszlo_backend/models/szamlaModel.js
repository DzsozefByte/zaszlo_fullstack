const db = require("../config/db");

class Szamla {
  static normalizeText(value) {
    if (typeof value !== "string") {
      return "";
    }
    return value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  static async listPaymentMethods(connection = db) {
    const [rows] = await connection.query(
      `
      SELECT
        fm.id,
        fm.nev,
        COUNT(s.szamla_id) AS szamlaDarab
      FROM fizetesi_mod fm
      LEFT JOIN szamla s ON s.fizetesi_mod = fm.id
      GROUP BY fm.id, fm.nev
      ORDER BY fm.id ASC
      `
    );
    return rows;
  }

  static getValidatedPaymentMethodName(rawName) {
    const nev = typeof rawName === "string" ? rawName.trim() : "";
    if (!nev) {
      const error = new Error("A fizetesi mod neve kotelezo.");
      error.code = "INVALID_INPUT";
      throw error;
    }

    return nev;
  }

  static async getPaymentMethodById(id, connection = db) {
    const [rows] = await connection.query(
      `
      SELECT
        fm.id,
        fm.nev,
        COUNT(s.szamla_id) AS szamlaDarab
      FROM fizetesi_mod fm
      LEFT JOIN szamla s ON s.fizetesi_mod = fm.id
      WHERE fm.id = ?
      GROUP BY fm.id, fm.nev
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  }

  static isCashLike(value) {
    return (
      value.includes("keszpenz") ||
      value.includes("utanvet") ||
      value.includes("cash")
    );
  }

  static isCardLike(value) {
    return (
      value.includes("kartya") ||
      value.includes("bankkartya") ||
      value.includes("card")
    );
  }

  static async resolvePaymentMethod(connection, paymentInput) {
    const numericCandidate = Number(
      typeof paymentInput === "object" && paymentInput !== null
        ? paymentInput.fizetesiModId ?? paymentInput.id
        : paymentInput
    );

    if (Number.isInteger(numericCandidate) && numericCandidate > 0) {
      const [rows] = await connection.query(
        "SELECT id, nev FROM fizetesi_mod WHERE id = ? LIMIT 1",
        [numericCandidate]
      );
      if (rows.length) {
        return rows[0];
      }
      const error = new Error("A kivalasztott fizetesi mod nem letezik.");
      error.code = "INVALID_PAYMENT_METHOD";
      throw error;
    }

    const methods = await this.listPaymentMethods(connection);
    if (!methods.length) {
      const error = new Error("Nincs elerheto fizetesi mod a rendszerben.");
      error.code = "MISSING_PAYMENT_METHOD";
      throw error;
    }

    const rawString =
      typeof paymentInput === "string"
        ? paymentInput
        : typeof paymentInput === "object" && paymentInput !== null
        ? paymentInput.fizetesiMod || paymentInput.nev || ""
        : "";

    const normalizedInput = this.normalizeText(rawString);
    if (!normalizedInput) {
      return methods[0];
    }

    const directMatch = methods.find(
      (method) => this.normalizeText(method.nev) === normalizedInput
    );
    if (directMatch) {
      return directMatch;
    }

    const aliasMatch = methods.find((method) => {
      const normalizedName = this.normalizeText(method.nev);
      if (this.isCardLike(normalizedInput) && this.isCardLike(normalizedName)) {
        return true;
      }
      if (this.isCashLike(normalizedInput) && this.isCashLike(normalizedName)) {
        return true;
      }
      return false;
    });

    if (aliasMatch) {
      return aliasMatch;
    }

    const error = new Error("A megadott fizetesi mod nem ervenyes.");
    error.code = "INVALID_PAYMENT_METHOD";
    throw error;
  }

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

  static async mapTetelBySzamlaIds(connection, szamlaIds) {
    if (!Array.isArray(szamlaIds) || !szamlaIds.length) {
      return {};
    }

    const [rows] = await connection.query(
      `
      SELECT
        rr.szamla_id,
        rr.zaszlo_id,
        rr.meret,
        rr.anyag,
        rr.mennyiseg,
        rr.egyseg_ar,
        (rr.mennyiseg * rr.egyseg_ar) AS tetel_osszeg,
        o.orszag
      FROM rendeles_reszletek rr
      LEFT JOIN zaszlok z ON z.id = rr.zaszlo_id
      LEFT JOIN orszagok o ON o.id = z.orszagId
      WHERE rr.szamla_id IN (?)
      ORDER BY rr.szamla_id DESC, rr.zaszlo_id ASC, rr.meret ASC, rr.anyag ASC
      `,
      [szamlaIds]
    );

    return rows.reduce((acc, row) => {
      if (!acc[row.szamla_id]) {
        acc[row.szamla_id] = [];
      }
      acc[row.szamla_id].push(row);
      return acc;
    }, {});
  }

  static async create(vevoId, paymentInput, kosar) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const paymentMethod = await this.resolvePaymentMethod(connection, paymentInput);

      const ma = new Date().toISOString().split("T")[0];
      const szamlaszam = `SZ-${Date.now().toString().slice(-6)}`;

      const [header] = await connection.query(
        `
        INSERT INTO szamla (fizetesi_mod, teljesites_kelte, szamla_kelte, fizetesi_hatarido, vevo_id, szamlaszam)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [paymentMethod.id, ma, ma, ma, vevoId, szamlaszam]
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
            Number(item.db) || 0,
            Number(item.ar) || 0,
          ]);
        }

        if (tetelAdatok.length) {
          await connection.query(
            `
            INSERT INTO rendeles_reszletek (szamla_id, zaszlo_id, meret, anyag, mennyiseg, egyseg_ar)
            VALUES ?
            `,
            [tetelAdatok]
          );
        }
      }

      await connection.commit();
      return {
        success: true,
        szamlaId: ujSzamlaId,
        szamlaszam,
        fizetesiModId: paymentMethod.id,
        fizetesiModNev: paymentMethod.nev,
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async getByUserId(vevoId) {
    const [headers] = await db.query(
      `
      SELECT
        s.*,
        s.szamla_id AS id,
        fm.nev AS fizetesi_mod_nev,
        COALESCE(t.vegosszeg, 0) AS vegosszeg
      FROM szamla s
      LEFT JOIN fizetesi_mod fm ON fm.id = s.fizetesi_mod
      LEFT JOIN (
        SELECT szamla_id, SUM(mennyiseg * egyseg_ar) AS vegosszeg
        FROM rendeles_reszletek
        GROUP BY szamla_id
      ) t ON t.szamla_id = s.szamla_id
      WHERE s.vevo_id = ?
      ORDER BY s.szamla_kelte DESC, s.szamla_id DESC
      `,
      [vevoId]
    );

    if (!headers.length) {
      return [];
    }

    const detailMap = await this.mapTetelBySzamlaIds(
      db,
      headers.map((row) => row.id)
    );

    return headers.map((row) => ({
      ...row,
      tetelek: detailMap[row.id] || [],
    }));
  }

  static async getAllForAdmin() {
    const [headers] = await db.query(`
      SELECT
        s.*,
        s.szamla_id AS id,
        fm.nev AS fizetesi_mod_nev,
        v.nev AS vevo_nev,
        v.email AS vevo_email,
        COALESCE(t.vegosszeg, 0) AS vegosszeg
      FROM szamla s
      JOIN vevo v ON v.id = s.vevo_id
      LEFT JOIN fizetesi_mod fm ON fm.id = s.fizetesi_mod
      LEFT JOIN (
        SELECT szamla_id, SUM(mennyiseg * egyseg_ar) AS vegosszeg
        FROM rendeles_reszletek
        GROUP BY szamla_id
      ) t ON t.szamla_id = s.szamla_id
      ORDER BY s.szamla_kelte DESC, s.szamla_id DESC
    `);

    if (!headers.length) {
      return [];
    }

    const detailMap = await this.mapTetelBySzamlaIds(
      db,
      headers.map((row) => row.id)
    );

    return headers.map((row) => ({
      ...row,
      tetelek: detailMap[row.id] || [],
    }));
  }

  static async deleteByIdForAdmin(id) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [target] = await connection.query(
        "SELECT szamla_id FROM szamla WHERE szamla_id = ? LIMIT 1",
        [id]
      );
      if (!target.length) {
        await connection.rollback();
        return 0;
      }

      const [deletedItems] = await connection.query(
        "DELETE FROM rendeles_reszletek WHERE szamla_id = ?",
        [id]
      );
      const [deletedInvoice] = await connection.query(
        "DELETE FROM szamla WHERE szamla_id = ?",
        [id]
      );

      await connection.commit();
      return {
        deletedInvoiceCount: deletedInvoice.affectedRows,
        deletedItemCount: deletedItems.affectedRows,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async createPaymentMethod(rawName) {
    const nev = this.getValidatedPaymentMethodName(rawName);

    const [duplicate] = await db.query(
      "SELECT id FROM fizetesi_mod WHERE LOWER(nev) = LOWER(?) LIMIT 1",
      [nev]
    );
    if (duplicate.length) {
      const error = new Error("Ilyen fizetesi mod mar letezik.");
      error.code = "DUPLICATE_PAYMENT_METHOD";
      throw error;
    }

    const [result] = await db.query("INSERT INTO fizetesi_mod (nev) VALUES (?)", [nev]);
    return this.getPaymentMethodById(result.insertId);
  }

  static async updatePaymentMethod(id, rawName) {
    const nev = this.getValidatedPaymentMethodName(rawName);

    const target = await this.getPaymentMethodById(id);
    if (!target) {
      return null;
    }

    const [duplicate] = await db.query(
      "SELECT id FROM fizetesi_mod WHERE LOWER(nev) = LOWER(?) AND id <> ? LIMIT 1",
      [nev, id]
    );
    if (duplicate.length) {
      const error = new Error("Ilyen fizetesi mod mar letezik.");
      error.code = "DUPLICATE_PAYMENT_METHOD";
      throw error;
    }

    await db.query("UPDATE fizetesi_mod SET nev = ? WHERE id = ?", [nev, id]);
    return this.getPaymentMethodById(id);
  }

  static async deletePaymentMethod(id) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [target] = await connection.query(
        "SELECT id, nev FROM fizetesi_mod WHERE id = ? LIMIT 1",
        [id]
      );
      if (!target.length) {
        await connection.rollback();
        return null;
      }

      const [usedCount] = await connection.query(
        "SELECT COUNT(*) AS count FROM szamla WHERE fizetesi_mod = ?",
        [id]
      );

      if ((usedCount[0]?.count || 0) > 0) {
        const error = new Error("A fizetesi mod mar hasznalatban van, nem torolheto.");
        error.code = "PAYMENT_METHOD_IN_USE";
        throw error;
      }

      await connection.query("DELETE FROM fizetesi_mod WHERE id = ?", [id]);

      await connection.commit();
      return target[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Szamla;
