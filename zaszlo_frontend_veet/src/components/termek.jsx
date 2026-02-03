import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import httpCommon from "../http-common";
import Button from "react-bootstrap/Button";
import BreadcrumbNav from "./BreadcrumbNav";
import { KosarContext } from "../context/KosarContext"; 
import { IoMdCart, IoMdCheckmarkCircleOutline, IoMdInformationCircleOutline } from "react-icons/io";

const ANYAG_SZORZOK = { "poliészter": 1, "selyem": 1.5, "nylon": 2, "rPET": 2 };
const MERET_SZORZOK = { "15x25cm": 1, "60x40cm": 1, "90x60cm": 1.5, "150x90cm": 3, "200x100cm": 4, "300x150cm": 6 };

const Termek = () => {
    const { country } = useParams();
    const [variants, setVariants] = useState([]);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const { kosarbaRak, setIsMiniCartOpen } = useContext(KosarContext);

    const fetchVariants = async () => {
        try {
            const response = await httpCommon.get(`/zaszlok/search?orszag=${encodeURIComponent(country)}`);
            const data = Array.isArray(response.data) ? response.data : [response.data];
            const exactMatches = data.filter(v => v.orszag.trim().toLowerCase() === country.trim().toLowerCase());
            const finalData = exactMatches.length ? exactMatches : data;

            setVariants(finalData);
            if (finalData[0]) {
                setSelectedSize(finalData[0].meret);
                setSelectedMaterial(finalData[0].anyag);
            }
        } catch (error) { console.error("Hiba:", error); }
    };

    useEffect(() => { fetchVariants(); }, [country]);

    if (!variants.length) return <div className="text-center mt-5 p-5"><div className="spinner-border text-primary"></div></div>;

    const product = variants[0];
    const currentVariant = variants.find(v => v.meret === selectedSize && v.anyag === selectedMaterial) || product;
    const availableSizes = [...new Set(variants.map(v => v.meret))];
    const availableMaterials = [...new Set(variants.map(v => v.anyag))];

    const BAZIS_AR = 1800;
    const vegsoAr = Math.round(BAZIS_AR * (MERET_SZORZOK[selectedSize] || 1) * (ANYAG_SZORZOK[selectedMaterial] || 1));

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
        setTimeout(() => setIsMiniCartOpen(false), 5000);
    };

    return (
        <div style={{ backgroundColor: "#f9fafb", minHeight: "90vh" }}>
            <div className="container py-4">
                <BreadcrumbNav items={[{ label: "Kezdőlap", to: "/" }, { label: "Termékek", to: "/kereso" }, { label: product.orszag, active: true }]} />

                <div className="row g-5 mt-2">
                    {/* --- BAL OLDAL: KÉP --- */}
                    <div className="col-lg-6">
                        <div className="p-5 bg-white shadow-sm rounded-4 d-flex align-items-center justify-content-center position-relative" style={{ minHeight: "400px" }}>
                            <img 
                                src={`/images/${currentVariant.id}.png`} 
                                alt={`${product.orszag} zászló`}
                                className="img-fluid"
                                style={{ maxHeight: "350px", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.15))" }}
                            />
                            <div className="position-absolute bottom-0 start-0 p-3">
                                <span className="badge bg-light text-dark border"><IoMdInformationCircleOutline/> Illusztráció</span>
                            </div>
                        </div>
                    </div>

                    {/* --- JOBB OLDAL: KONFIGURÁCIÓ --- */}
                    <div className="col-lg-6">
                        <h1 className="display-5 fw-bold mb-3">{product.orszag} zászló</h1>

                        <div className="p-4 bg-white rounded-4 shadow-sm border mb-4">
                            <h4 className="fw-bold mb-4">Konfiguráció</h4>
                            
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-muted text-uppercase small">Méret kiválasztása</label>
                                <select className="form-select form-select-lg" value={selectedSize} onChange={e => setSelectedSize(e.target.value)}>
                                    {availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-semibold text-muted text-uppercase small">Anyag típusa</label>
                                <div className="d-flex gap-2 flex-wrap">
                                    {availableMaterials.map(mat => (
                                        <button 
                                            key={mat}
                                            className={`btn ${selectedMaterial === mat ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => setSelectedMaterial(mat)}
                                        >
                                            {mat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <hr className="my-4"/>

                            <div className="d-flex justify-content-between align-items-end mb-3">
                                <div>
                                    <span className="d-block text-muted small">Fizetendő összeg:</span>
                                    <span className="display-6 fw-bold text-dark">{vegsoAr.toLocaleString()} Ft</span>
                                </div>
                            </div>

                            <Button variant="primary" size="lg" className="w-100 py-3 rounded-pill fw-bold shadow-sm" onClick={handleAddToCart}>
                                <IoMdCart className="me-2" size={24}/> Kosárba rakom
                            </Button>
                        </div>

                        {/* --- EXTRA INFÓK --- */}
                        <div className="d-flex gap-4 text-muted small">
                            <div className="d-flex align-items-center"><IoMdCheckmarkCircleOutline className="text-success me-2" size={20}/> Raktáron</div>
                            <div className="d-flex align-items-center"><IoMdCheckmarkCircleOutline className="text-success me-2" size={20}/> 1-2 napos szállítás</div>
                            <div className="d-flex align-items-center"><IoMdCheckmarkCircleOutline className="text-success me-2" size={20}/> Prémium anyag</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Termek;