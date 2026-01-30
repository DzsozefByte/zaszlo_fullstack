import httpCommon from "../http-common";
import { useState, useEffect, useRef } from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Carousel from 'react-bootstrap/Carousel';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from "react-router-dom";

import './Fooldal.css';

// --- ÚJ KOMPONENS: Értékajánlat Sáv ---
const FeaturesBar = () => (
  <div className="features-bar">
    <Container>
      <Row className="text-center py-4">
        <Col md={4} className="feature-item mb-3 mb-md-0">
          <i className="bi bi-patch-check-fill text-primary feature-icon"></i>
          <h5 className="mt-2">Prémium Minőség</h5>
          <p className="text-muted small mb-0">Tartós anyagok, élénk színek.</p>
        </Col>
        <Col md={4} className="feature-item mb-3 mb-md-0">
          <i className="bi bi-globe-americas text-primary feature-icon"></i>
          <h5 className="mt-2">Óriási Választék</h5>
          <p className="text-muted small mb-0">Több mint 200 ország zászlaja.</p>
        </Col>
        <Col md={4} className="feature-item">
          <i className="bi bi-truck text-primary feature-icon"></i>
          <h5 className="mt-2">Gyors Szállítás</h5>
          <p className="text-muted small mb-0">Akár 1-2 munkanapon belül.</p>
        </Col>
      </Row>
    </Container>
  </div>
);

// --- FRISSÍTETT KOMPONENS: FlagSection ---
const FlagSection = ({ title, items, sectionKey }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scroll = (scrollOffset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollOffset, behavior: "smooth" });
    }
  };

  const handleNavigate = (orszag) => {
    navigate(`/termek/${encodeURIComponent(orszag)}`);
  };

  return (
    <section className="flag-section-wrapper my-5">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="section-title mb-0">{title}</h2>
          <div className="scroll-controls d-none d-md-flex">
            <button
              className="scroll-btn prev me-2"
              aria-label="Előző"
              onClick={() => scroll(-320)}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button
              className="scroll-btn next"
              aria-label="Következő"
              onClick={() => scroll(320)}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="horizontal-scroll-container"
          role="region"
          aria-label={title}
        >
          {items.map((z, index) => (
            <Card
              key={index}
              className="modern-flag-card h-100"
              onClick={() => handleNavigate(z.orszag)}
            >
              <div className="card-img-wrapper">
                <Card.Img
                  variant="top"
                  src={`/images/${z.id}.png`}
                  alt={z.orszag}
                  className="img-fluid"
                  loading="lazy" // Teljesítmény optimalizálás
                />
              </div>
              <Card.Body className="d-flex flex-column justify-content-between text-center p-3">
                <Card.Title as="h5" className="fw-bold text-truncate w-100 mb-3">
                  {z.orszag}
                </Card.Title>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="stretched-link w-100 rounded-pill fw-semibold"
                  onClick={(e) => {
                    // A stretched-link miatt a gomb kattintás is a kártya kattintást indítja,
                    // de ha külön logikát akarnánk, itt megállíthatnánk: e.stopPropagation();
                  }}
                >
                  Részletek
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
};


// --- FŐ KOMPONENS: Fooldal ---
const Fooldal = () => {
  const [zaszlok, setZaszlok] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await httpCommon.get("/zaszlok");
      setZaszlok(response.data);
    } catch (error) {
      console.error("Hiba az adatok lekérése során:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const popularCountries = ["Magyarország", "Németország", "Franciaország", "Olaszország", "Egyesült Államok", "Egyesült Királyság", "Spanyolország", "Kanada", "Japán"];
  const euCountries = [
    "Ausztria","Belgium","Bulgária","Ciprus","Csehország","Dánia","Észtország","Finnország","Franciaország",
    "Görögország","Hollandia","Horvátország","Írország","Lengyelország","Lettország","Litvánia","Luxemburg",
    "Magyarország","Málta","Németország","Olaszország","Portugália","Románia","Spanyolország","Svédország",
    "Szlovákia","Szlovénia"
  ];

  const popularFlags = zaszlok.filter(z => popularCountries.includes(z.orszag));
  const euFlags = zaszlok.filter(z => euCountries.includes(z.orszag));
  const otherFlags = zaszlok.filter(z => !popularCountries.includes(z.orszag) && !euCountries.includes(z.orszag));

  return (
    <div className="homepage-wrapper">
      {/* Hero Carousel */}
      <div className="hero-section">
        <Carousel fade indicators={false} controls={false} interval={5000}>
          {[
            { img: '/images/stock1.jpg', title: 'Fedezd fel a világ színeit', text: 'Prémium minőségű zászlók minden nemzet számára.' },
            { img: '/images/stock2.jpeg', title: 'Mutasd meg hovatartozásod', text: 'Legyen szó sporteseményről vagy ünnepről.' },
            { img: '/images/stock3.jpg', title: 'A zászlók szakértője', text: 'Több mint 10 éve a gyűjtők és rajongók szolgálatában.' }
          ].map((item, index) => (
            <Carousel.Item key={index} className="hero-carousel-item">
              {/* Feltételezzük, hogy a képek léteznek. Ha nincs stock fotód, használj placeholdert teszteléshez:
                  src={`https://picsum.photos/1920/600?random=${index}`} */}
              <div
                className="hero-bg-image"
                style={{ backgroundImage: `url(${item.img})` }}
              ></div>
              <div className="hero-overlay">
                <Container className="h-100 d-flex align-items-center justify-content-center justify-content-md-start">
                  <div className="hero-caption text-center text-md-start">
                    <h1 className="display-4 fw-bolder text-white mb-3">{item.title}</h1>
                    <p className="lead text-white-50 mb-4 d-none d-md-block">
                      {item.text}
                    </p>
                    <Button variant="primary" size="lg" className="rounded-pill px-5 fw-bold shadow-sm">
                      Böngészés
                    </Button>
                  </div>
                </Container>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      {/* Features Bar */}
      <FeaturesBar />

      {/* Content Sections */}
      <div className="content-sections py-4">
        {isLoading ? (
          <Container className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Betöltés...</span>
            </div>
          </Container>
        ) : (
          <>
            {popularFlags.length > 0 && <FlagSection title="Legnépszerűbb választások" items={popularFlags} sectionKey="popular" />}
            {euFlags.length > 0 && <FlagSection title="Európai Unió tagállamai" items={euFlags} sectionKey="eu" />}
            {otherFlags.length > 0 && <FlagSection title="További országok a világból" items={otherFlags} sectionKey="other" />}
          </>
        )}
      </div>
    </div>
  );
};

export default Fooldal;