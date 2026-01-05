import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import httpCommon from "../http-common";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import BreadcrumbNav from "./BreadcrumbNav";
import { KosarContext } from "../context/KosarContext"; 

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
    const navigate = useNavigate();
    const [variants, setVariants] = useState([]);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState("");

    // Context funkciók és state behúzása
    const { kosarbaRak, setIsMiniCartOpen } = useContext(KosarContext);

    const fetchVariants = async () => {
        try {
            let url = `/zaszlok/search?orszag=${encodeURIComponent(country)}`;
            const response = await httpCommon.get(url);
            const data = Array.isArray(response.data) ? response.data : [response.data];
            setVariants(data);

            if (data[0]) {
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

    // Ár számítása
    const BAZIS_AR = 1800;
    const anyagSzorzo = ANYAG_SZORZOK[selectedMaterial] || 1;
    const meretSzorzo = MERET_SZORZOK[selectedSize] || 1;
    const vegsoAr = Math.round(BAZIS_AR * meretSzorzo * anyagSzorzo);

    if (!variants.length) return <div className="text-center mt-5">Betöltés...</div>;
    
    const product = variants[0];
    const currentVariant = variants.find(v => v.meret === selectedSize && v.anyag === selectedMaterial) || product;
    const availableSizes = [...new Set(variants.map(v => v.meret))];
    const availableMaterials = [...new Set(variants.map(v => v.anyag))];

    // --- KOSÁRBA RAKÁS KEZELŐ (ÚJ LOGIKA) ---
    const handleAddToCart = () => {
        const tetel = {
            id: currentVariant.id,
            orszag: product.orszag,
            meret: selectedSize,
            anyag: selectedMaterial,
            ar: vegsoAr,
            kep: `/images/${currentVariant.id}.png`
        };

        // 1. Termék hozzáadása a context-hez
        kosarbaRak(tetel);
        
        // 2. Mini kosár kinyitása (hogy a felhasználó lássa, mi történt)
        setIsMiniCartOpen(true);

        // 3. Felgörgetés az oldal tetejére, ha mobilon vagyunk, hogy látszódjon a header
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 4. Automatikus bezárás 5 másodperc múlva (opcionális, de kényelmes)
        setTimeout(() => {
            setIsMiniCartOpen(false);
        }, 5000);
    };

    return (
        <>
            <BreadcrumbNav items={[{ label: "Kezdőlap", to: "/" }, { label: product.orszag, active: true }]} />

            <div className="container mt-4 mb-5">
                <div className="row justify-content-center">
                    <div className="col-md-5">
                        <Card className="shadow-sm p-3">
                            <Card.Img 
                                src={`/images/${currentVariant.id}.png`} 
                                style={{ maxHeight: "350px", objectFit: "contain" }} 
                            />
                        </Card>
                    </div>

                    <div className="col-md-6">
                        <h2 className="fw-bold mb-3">{product.orszag} zászló</h2>
                        
                        <div className="mb-3">
                            <label className="fw-bold">Méret:</label>
                            <select className="form-select" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                                {availableSizes.map(size => <option key={size}>{size}</option>)}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="fw-bold">Anyag:</label>
                            <select className="form-select" value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)}>
                                {availableMaterials.map(mat => <option key={mat}>{mat}</option>)}
                            </select>
                        </div>

                        <hr />
                        <p>Ár: <strong className="fs-4">{vegsoAr.toLocaleString()} Ft</strong></p>

                        <Button variant="primary" size="lg" className="w-100" onClick={handleAddToCart}>
                            <i className="bi bi-cart-plus me-2"></i> Kosárba
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Termek;