import React, { useEffect, useState } from "react";
import { KosarContext } from "./kosar-context.js";

export const KosarProvider = ({ children }) => {
    // 1. KOSÁR BETÖLTÉSE: Első indításkor megnézi a localStorage-ot
    const [kosar, setKosar] = useState(() => {
        try {
            const mentes = localStorage.getItem("kosar_tartalom");
            return mentes ? JSON.parse(mentes) : [];
        } catch (error) {
            console.error("Hiba a kosár betöltésekor:", error);
            return [];
        }
    });
    
    const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);

    // 2. AUTOMATIKUS MENTÉS: Amikor a 'kosar' változik, frissítjük a localStorage-ot
    useEffect(() => {
        localStorage.setItem("kosar_tartalom", JSON.stringify(kosar));
    }, [kosar]);

    const vegosszeg = kosar.reduce((acc, item) => acc + (item.ar * item.db), 0);

    const kosarbaRak = (termek) => {
        setKosar((aktualisKosar) => {
            const letezoElem = aktualisKosar.find(
                (item) => item.id === termek.id && item.meret === termek.meret && item.anyag === termek.anyag
            );

            if (letezoElem) {
                return aktualisKosar.map((item) =>
                    item.id === termek.id && item.meret === termek.meret && item.anyag === termek.anyag
                        ? { ...item, db: item.db + 1 }
                        : item
                );
            }

            return [...aktualisKosar, { ...termek, db: 1 }];
        });
    };

    const torlesKosarbol = (id, meret, anyag) => {
        setKosar((aktualisKosar) =>
            aktualisKosar.filter(
                (item) => !(item.id === id && item.meret === meret && item.anyag === anyag)
            )
        );
    };

    const dbModositas = (id, meret, anyag, mennyiseg) => {
        setKosar((aktualisKosar) =>
            aktualisKosar.flatMap((item) => {
                if (item.id === id && item.meret === meret && item.anyag === anyag) {
                    const ujDb = item.db + mennyiseg;
                    return ujDb > 0 ? [{ ...item, db: ujDb }] : [];
                }

                return [item];
            })
        );
    };

    return (
        <KosarContext.Provider value={{
            kosar,
            setKosar, // Most már elérhető kívülről is
            kosarbaRak,
            torlesKosarbol,
            dbModositas,
            vegosszeg,
            isMiniCartOpen,
            setIsMiniCartOpen
        }}>
            {children}
        </KosarContext.Provider>
    );
};
