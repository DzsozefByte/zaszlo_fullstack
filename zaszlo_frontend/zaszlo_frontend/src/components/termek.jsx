import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import httpCommon from "../http-common";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

const Termek = () => {
    const { country } = useParams();

    const [variants, setVariants] = useState([]);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState("");

    const fetchVariants = async () => {
        try {
            // URL építése Kína workaround-jával
            let url = `/zaszlok/search?orszag=${encodeURIComponent(country)}`;
            if (country === "Kína") {
                url = `/zaszlok/37`; // Kína ID-ja
            }

            const response = await httpCommon.get(url);
            
            // Ha nem tömb, alakítsd tömbbé
            setVariants(Array.isArray(response.data) ? response.data : [response.data]);

            // alapértelmezett kiválasztás az első variáció
            const firstVariant = Array.isArray(response.data) ? response.data[0] : response.data;
            if (firstVariant) {
                setSelectedSize(firstVariant.meret);
                setSelectedMaterial(firstVariant.anyag);
            }

        } catch (error) {
            console.error("Hiba a variációk lekérésekor:", error);
        }
    };

    useEffect(() => {
        fetchVariants();
    }, [country]);

    if (!variants.length) {
        return (
            <div className="text-center mt-5">
                <h3>Betöltés...</h3>
            </div>
        );
    }

    const product = variants[0]; // ország neve, kontinens stb. innen jön

    const availableSizes = [...new Set(variants.map(v => v.meret))];
    const availableMaterials = [...new Set(variants.map(v => v.anyag))];

    // A kép kiválasztása méret + anyag alapján
    const currentVariant =
        variants.find(v => v.meret === selectedSize && v.anyag === selectedMaterial)
        || product;

    return (
        <div className="container mt-5 mb-5">
            <div className="row justify-content-center">

                {/* Kép */}
                <div className="col-md-5">
                    <Card className="shadow-sm p-3" style={{ borderRadius: "15px" }}>
                        <Card.Img
                            variant="top"
                            src={`/images/${currentVariant.id}.png`}
                            style={{
                                maxHeight: "350px",
                                objectFit: "contain",
                                padding: "1rem"
                            }}
                        />
                    </Card>
                </div>

                {/* Jobb oldal */}
                <div className="col-md-6">
                    <h2 className="fw-bold mb-3">{product.orszag} zászló</h2>

                    <p className="text-muted">
                        <strong>Kontinens:</strong> {product.kontinens}
                    </p>

                    {/* Méret */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Méret:</label>
                        <select
                            className="form-select"
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                        >
                            {availableSizes.map(size => (
                                <option key={size}>{size}</option>
                            ))}
                        </select>
                    </div>

                    {/* Anyag */}
                    <div className="mb-4">
                        <label className="form-label fw-bold">Anyag:</label>
                        <select
                            className="form-select"
                            value={selectedMaterial}
                            onChange={(e) => setSelectedMaterial(e.target.value)}
                        >
                            {availableMaterials.map(mat => (
                                <option key={mat}>{mat}</option>
                            ))}
                        </select>
                    </div>

                    <hr />

                    <p>
                        Ez a(z) <strong>{product.orszag}</strong> zászló több méretben és anyagban is elérhető.
                        Válaszd ki a neked megfelelőt!
                    </p>

                    <Button
                        variant="primary"
                        size="lg"
                        style={{ width: "100%" }}
                    >
                        Kosárba
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Termek;
