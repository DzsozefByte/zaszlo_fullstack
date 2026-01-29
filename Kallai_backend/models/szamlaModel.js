const db = require('../config/db');

class Szamla {
    static async create(vevoId, fizetesiMod, kosar) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Számla fejléc (szamla tábla)
            const ma = new Date().toISOString().split('T')[0];
            const szamlaszam = `SZ-${Date.now().toString().slice(-6)}`;

            const [header] = await connection.query(
                `INSERT INTO szamla (fizetesi_mod, teljesites_kelte, szamla_kelte, fizetesi_hatarido, vevo_id, szamlaszam) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [fizetesiMod === 'kartya' ? 2 : 1, ma, ma, ma, vevoId, szamlaszam]
            );

            const ujSzamlaId = header.insertId;

            // 2. Tételek (rendeles_reszletek tábla)
            if (kosar && kosar.length > 0) {
                const tetelAdatok = kosar.map(item => [
                    ujSzamlaId, 
                    item.id,      // zaszlo_id
                    item.db,      // mennyiseg
                    item.ar       // egyseg_ar
                ]);

                await connection.query(
                    `INSERT INTO rendeles_reszletek (szamla_id, zaszlo_id, mennyiseg, egyseg_ar) VALUES ?`,
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
}
module.exports = Szamla;