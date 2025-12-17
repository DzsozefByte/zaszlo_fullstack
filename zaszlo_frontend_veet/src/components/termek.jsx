import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import httpCommon from "../http-common";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import BreadcrumbNav from "./BreadcrumbNav";

const ANYAG_SZORZOK = {
    "poliészter": 1,
    "selyem": 1.5,
    "nylon": 2,
    "rPET": 2
};

const MERET_SZORZOK = {
    "15x25cm": 1,
    "90x60cm": 1.5,
    "150x90cm": 3,
    "200x100cm": 4,
    "300x150cm": 6
};

const Termek = () => {
    const { country } = useParams();
    const [variants, setVariants] = useState([]);
    
    // State-ek a kiválasztáshoz
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState("");

    const fetchVariants = async () => {
        try {
            // ... (a lekérdezésed marad változatlan) ...
            let url = `/zaszlok/search?orszag=${encodeURIComponent(country)}`;
            if (country === "Kína") url = `/zaszlok/37`; // Példa fix

            const response = await httpCommon.get(url);
            const data = Array.isArray(response.data) ? response.data : [response.data];
            
            setVariants(data);

            if (data[0]) {
                // Beállítjuk az alapértelmezett választást az első elemre
                setSelectedSize(data[0].meret);
                setSelectedMaterial(data[0].anyag);
            }
        } catch (error) {
            console.error("Hiba:", error);
        }
    };

    useEffect(() => {
        fetchVariants();
    }, [country]);

    // --- 2. ÁR SZÁMÍTÁSA (Nem kell useEffect, nem kell useState!) ---
    
    // Alapár definíció
    const BAZIS_AR = 1800;

    // Megkeressük a szorzót a fenti táblázatból. 
    // A "|| 1" azt jelenti, hogy ha véletlenül nincs benne a listában, akkor 1-gyel szoroz.
    const anyagSzorzo = ANYAG_SZORZOK[selectedMaterial] || 1;
    const meretSzorzo = MERET_SZORZOK[selectedSize] || 1;

    // A végső matek:
    const vegsoAr = BAZIS_AR * meretSzorzo * anyagSzorzo;

    // --- Kép és termék megjelenítéséhez szükséges logika ---
    if (!variants.length) return <div className="text-center mt-5"><h3>Betöltés...</h3></div>;
    
    const product = variants[0]; // Csak az általános adatokhoz (pl. ország neve)
    
    // A képet megpróbáljuk a pontos variáció alapján betölteni
    const currentVariant = variants.find(v => v.meret === selectedSize && v.anyag === selectedMaterial) || product;

    const availableSizes = [...new Set(variants.map(v => v.meret))];
    const availableMaterials = [...new Set(variants.map(v => v.anyag))];

    return (
        <>
            <BreadcrumbNav items={[{ label: "Kezdőlap", to: "/" }, { label: product.orszag, active: true }]} />

            <div className="container mt-4 mb-5">
                <div className="row justify-content-center">
                    <div className="col-md-5">
                         {/* Kép */}
                        <Card className="shadow-sm p-3">
                            <Card.Img 
                                src={`/images/${currentVariant.id}.png`} 
                                style={{ maxHeight: "350px", objectFit: "contain" }} 
                            />
                        </Card>
                    </div>

                    <div className="col-md-6">
                        <h2 className="fw-bold mb-3">{product.orszag} zászló</h2>
                        
                        {/* Méret választó */}
                        <div className="mb-3">
                            <label className="fw-bold">Méret:</label>
                            <select 
                                className="form-select" 
                                value={selectedSize} 
                                onChange={(e) => setSelectedSize(e.target.value)}
                            >
                                {availableSizes.map(size => <option key={size}>{size}</option>)}
                            </select>
                        </div>

                        {/* Anyag választó */}
                        <div className="mb-4">
                            <label className="fw-bold">Anyag:</label>
                            <select 
                                className="form-select" 
                                value={selectedMaterial} 
                                onChange={(e) => setSelectedMaterial(e.target.value)}
                            >
                                {availableMaterials.map(mat => <option key={mat}>{mat}</option>)}
                            </select>
                        </div>

                        <hr />

                        <p>
                            Ez a(z) <strong>{product.orszag}</strong> zászló több méretben és anyagban is elérhető.
                            Válaszd ki a neked megfelelőt!
                        </p>

                        {/* 3. ITT JELENÍTJÜK MEG A KISZÁMOLT ÁRAT */}
                        <p>
                            Ár: <strong>{vegsoAr.toLocaleString()} Ft</strong> <br/>
                            <span className="text-muted small">
                                (Alapár: {BAZIS_AR} Ft × {meretSzorzo} méretszorzó × {anyagSzorzo} anyagszorzó)
                            </span>
                        </p>

                        <Button variant="primary" size="lg" style={{ width: "100%" }}>
                            Kosárba
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Termek;