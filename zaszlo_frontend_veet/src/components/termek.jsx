import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import httpCommon from "../http-common";
import Button from "react-bootstrap/Button";
import BreadcrumbNav from "./BreadcrumbNav";
import { KosarContext } from "../context/kosar-context.js";
import { IoMdCart, IoMdCheckmarkCircleOutline, IoMdInformationCircleOutline } from "react-icons/io";

const BASE_PRICE = 1800;

const Termek = () => {
  const { country } = useParams();
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const { kosarbaRak, setIsMiniCartOpen } = useContext(KosarContext);

  useEffect(() => {
    let isMounted = true;

    const fetchVariants = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await httpCommon.get(`/zaszlok/search?orszag=${encodeURIComponent(country)}`);
        const data = Array.isArray(response.data) ? response.data : [response.data];
        const exactMatches = data.filter(
          (item) => item.orszag?.trim().toLowerCase() === country.trim().toLowerCase()
        );
        const finalData = exactMatches.length ? exactMatches : data;

        if (!isMounted) {
          return;
        }

        setVariants(finalData);
        setSelectedSize(finalData[0]?.meret || "");
        setSelectedMaterial(finalData[0]?.anyag || "");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Hiba tortent a termek valtozatok betoltese soran:", error);
        setVariants([]);
        setLoadError("A termek valtozatai jelenleg nem tolthetők be.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchVariants();

    return () => {
      isMounted = false;
    };
  }, [country]);

  if (loading) {
    return (
      <div className="text-center mt-5 p-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger mb-0" role="alert">
          {loadError}
        </div>
      </div>
    );
  }

  if (!variants.length) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning mb-0" role="alert">
          Ehhez az orszaghoz jelenleg nem talalhato megjelenitheto termekvariacio.
        </div>
      </div>
    );
  }

  const product = variants[0];
  const currentVariant =
    variants.find((item) => item.meret === selectedSize && item.anyag === selectedMaterial) ||
    product;

  const availableSizes = [...new Set(variants.map((item) => item.meret))];
  const availableMaterials = [...new Set(variants.map((item) => item.anyag))];

  const meretSzorzo = Number(currentVariant.meret_szorzo) || 1;
  const anyagSzorzo = Number(currentVariant.anyag_szorzo) || 1;
  const vegsoAr = Math.round(BASE_PRICE * meretSzorzo * anyagSzorzo);

  const orszagId = Number(currentVariant.orszagId || currentVariant.id);
  const variantId = Number(currentVariant.variantId || currentVariant.id);

  const handleAddToCart = () => {
    kosarbaRak({
      id: variantId,
      variantId,
      orszagId,
      orszag: product.orszag,
      meret: selectedSize,
      anyag: selectedMaterial,
      ar: vegsoAr,
      kep: `/images/${orszagId}.png`,
    });

    setIsMiniCartOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setIsMiniCartOpen(false), 5000);
  };

  return (
    <div className="termek-page" style={{ backgroundColor: "#f9fafb", minHeight: "90vh" }}>
      <div className="container py-4 termek-container">
        <BreadcrumbNav
          items={[
            { label: "Kezdőlap", to: "/" },
            { label: "Termékek", to: "/kereso" },
            { label: product.orszag, active: true },
          ]}
        />

        <div className="row g-5 mt-2 termek-layout">
          <div className="col-lg-6 termek-media-col">
            <div
              className="p-5 bg-white shadow-sm rounded-4 d-flex align-items-center justify-content-center position-relative termek-media-card"
              style={{ minHeight: "400px" }}
            >
              <img
                src={`/images/${orszagId}.png`}
                alt={`${product.orszag} zászló`}
                className="img-fluid termek-image"
                style={{ maxHeight: "350px", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.15))" }}
              />
              <div className="position-absolute bottom-0 start-0 p-3 termek-illustration-badge">
                <span className="badge bg-light text-dark border">
                  <IoMdInformationCircleOutline /> Illusztráció
                </span>
              </div>
            </div>
          </div>

          <div className="col-lg-6 termek-config-col">
            <h1 className="display-5 fw-bold mb-3 termek-title">{product.orszag} zászló</h1>

            <div className="p-4 bg-white rounded-4 shadow-sm border mb-4 termek-config-card">
              <h4 className="fw-bold mb-4">Konfiguráció</h4>

              <div className="mb-3 termek-size-wrap">
                  <label className="form-label fw-semibold text-muted text-uppercase small">
                    Méret kiválasztása
                  </label>
                <select
                  className="form-select form-select-lg termek-size-select"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  {availableSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4 termek-materials-wrap">
                  <label className="form-label fw-semibold text-muted text-uppercase small">
                    Anyag típusa
                  </label>
                <div className="d-flex gap-2 flex-wrap termek-materials">
                  {availableMaterials.map((material) => (
                    <button
                      key={material}
                      className={`btn ${
                        selectedMaterial === material ? "btn-primary" : "btn-outline-secondary"
                      } termek-material-btn`}
                      onClick={() => setSelectedMaterial(material)}
                    >
                      {material}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="my-4" />

              <div className="d-flex justify-content-between align-items-end mb-3 termek-price-row">
                <div>
                  <span className="d-block text-muted small">Fizetendő összeg:</span>
                  <span className="display-6 fw-bold text-dark termek-price">{vegsoAr.toLocaleString()} Ft</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-100 py-3 rounded-pill fw-bold shadow-sm termek-add-btn"
                onClick={handleAddToCart}
              >
                <IoMdCart className="me-2" size={24} />
                Kosárba rakom
              </Button>
            </div>

            <div className="d-flex gap-4 text-muted small termek-benefits">
              <div className="d-flex align-items-center termek-benefit-item">
                <IoMdCheckmarkCircleOutline className="text-success me-2" size={20} />
                Raktáron
              </div>
              <div className="d-flex align-items-center termek-benefit-item">
                <IoMdCheckmarkCircleOutline className="text-success me-2" size={20} />
                1-2 napos szállítás
              </div>
              <div className="d-flex align-items-center termek-benefit-item">
                <IoMdCheckmarkCircleOutline className="text-success me-2" size={20} />
                Prémium anyag
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Termek;
