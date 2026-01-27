import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
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
    "60x40cm": 1,
    "90x60cm": 1.5,
    "150x90cm": 3,
    "200x100cm": 4,
    "300x150cm": 6
};

const Termek = () => {
    const { country } = useParams();
    const [variants, setVariants] = useState([]);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState("");

    const { kosarbaRak, setIsMiniCartOpen } = useContext(KosarContext);

    const fetchVariants = async () => {
        try {
            const response = await httpCommon.get(
                `/zaszlok/search?orszag=${encodeURIComponent(country)}`
            );

            const data = Array.isArray(response.data)
                ? response.data
                : [response.data];

            // 🔒 PONTOS ORSZÁGNÉV SZŰRÉS
            const exactMatches = data.filter(
                v => v.orszag.trim().toLowerCase() === country.trim().toLowerCase()
            );

            const finalData = exactMatches.length ? exactMatches : data;

            setVariants(finalData);

            if (finalData[0]) {
                setSelectedSize(finalData[0].meret);
                setSelectedMaterial(finalData[0].anyag);
            }
        } catch (error) {
            console.error("Hiba a termék betöltésekor:", error);
        }
    };

    useEffect(() => {
        fetchVariants();
    }, [country]);

    if (!variants.length) {
        return <div className="text-center mt-5">Betöltés...</div>;
    }

    const product = variants[0];

    const currentVariant =
        variants.find(
            v => v.meret === selectedSize && v.anyag === selectedMaterial
        ) || product;

    const availableSizes = [...new Set(variants.map(v => v.meret))];
    const availableMaterials = [...new Set(variants.map(v => v.anyag))];

    const BAZIS_AR = 1800;
    const anyagSzorzo = ANYAG_SZORZOK[selectedMaterial] || 1;
    const meretSzorzo = MERET_SZORZOK[selectedSize] || 1;
    const vegsoAr = Math.round(BAZIS_AR * meretSzorzo * anyagSzorzo);

    const handleAddToCart = () => {
        kosarbaRak({
            id: currentVariant.id,
            orszag: product.orszag,
            meret: selectedSize,
            anyag: selectedMaterial,
            ar: vegsoAr,
            kep: `/images/${currentVariant.id}.png`
        });

        setIsMiniCartOpen(true);
        window.scrollTo({ top: 0, behavior: "smooth" });

        setTimeout(() => {
            setIsMiniCartOpen(false);
        }, 5000);
    };

    return (
        <>
            <BreadcrumbNav
                items={[
                    { label: "Kezdőlap", to: "/" },
                    { label: product.orszag, active: true }
                ]}
            />

            <div className="container mt-4 mb-5">
                <div className="row justify-content-center">
                    <div className="col-md-5">
                        <Card className="shadow-sm p-3">
                            <Card.Img
                                src={`/images/${currentVariant.id}.png`}
                                style={{
                                    maxHeight: "350px",
                                    objectFit: "contain"
                                }}
                            />
                        </Card>
                    </div>

                    <div className="col-md-6">
                        <h2 className="fw-bold mb-3">
                            {product.orszag} zászló
                        </h2>

                        <div className="mb-3">
                            <label className="fw-bold">Méret:</label>
                            <select
                                className="form-select"
                                value={selectedSize}
                                onChange={e => setSelectedSize(e.target.value)}
                            >
                                {availableSizes.map(size => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="fw-bold">Anyag:</label>
                            <select
                                className="form-select"
                                value={selectedMaterial}
                                onChange={e =>
                                    setSelectedMaterial(e.target.value)
                                }
                            >
                                {availableMaterials.map(mat => (
                                    <option key={mat} value={mat}>
                                        {mat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <hr />
                        <p>
                            Ár:{" "}
                            <strong className="fs-4">
                                {vegsoAr.toLocaleString()} Ft
                            </strong>
                        </p>

                        <Button
                            variant="primary"
                            size="lg"
                            className="w-100"
                            onClick={handleAddToCart}
                        >
                            <i className="bi bi-cart-plus me-2"></i>
                            Kosárba
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Termek;