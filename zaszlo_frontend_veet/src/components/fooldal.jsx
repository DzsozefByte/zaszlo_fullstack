import httpCommon from "../http-common";
import { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap-icons/font/bootstrap-icons.css';


import './Fooldal.css'; // Egyedi CSS fájl az oldal stílusához

const FlagSection = ({ title, items, sectionKey }) => {
  const scrollLeft = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollBy({ left: 300, behavior: "smooth" });
  };

  const sectionId = `sec-${sectionKey}`;

  return (
    <div className="flag-section" style={{ position: 'relative', margin: '2rem 0' }}>
      <h2 className="flag-section-title">{title}</h2>

      <button
        className="scroll-arrow left"
        aria-label="Előző"
        onClick={() => scrollLeft(sectionId)}
      >
        <i className="bi bi-chevron-left" style={{ fontSize: '1.2rem' }}></i>
      </button>

      <div
        id={sectionId}
        className="horizontal-card-row"
        role="region"
        aria-label={title}
      >
        {items.map((z, index) => (
          <Card
            key={index}
            className="flag-card"
            onClick={() => window.location.href = `/termek/${encodeURIComponent(z.orszag)}`}
          >
            <div className="flag-img-wrapper">
              <Card.Img
                variant="top"
                src={`/images/${z.id}.png`}
                alt={z.orszag}
                className="flag-img"
              />
            </div>
            <Card.Body style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <Card.Title className="flag-title">{z.orszag}</Card.Title>
              <Button variant="primary" onClick={(e) => { e.stopPropagation(); window.location.href = `/termek/${encodeURIComponent(z.orszag)}`; }}>
                Részletek
              </Button>
            </Card.Body>
          </Card>
        ))}
      </div>

      <button
        className="scroll-arrow right"
        aria-label="Következő"
        onClick={() => scrollRight(sectionId)}
      >
        <i className="bi bi-chevron-right" style={{ fontSize: '1.2rem' }}></i>
      </button>
    </div>
  );
};


const Fooldal = () => {
  const [zaszlok, setZaszlok] = useState([]);

  const fetchData = async () => {
    try {
      const response = await httpCommon.get("/zaszlok");
      setZaszlok(response.data);
    } catch (error) {
      console.error("Hiba az adatok lekérése során:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // kategóriák 
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', backgroundColor: '#f8f9fa', paddingBottom: '2rem' }}>
      <div style={{ width: '90%', margin: '2rem 0', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
        <Carousel fade>
          {[1, 2, 3].map((num) => (
            <Carousel.Item key={num} interval={3000}>
              <img
                className="d-block w-100"
                src={`/images/stock${num}${num === 2 ? '.jpeg' : '.jpg'}`}
                alt={`Slide ${num}`}
                style={{ objectFit: 'cover', height: '400px', filter: 'brightness(85%)' }}
              />
              <Carousel.Caption style={{
                bottom: '20%',
                background: 'rgba(0,0,0,0.5)',
                padding: '1rem 2rem',
                borderRadius: '10px'
              }}>
                <h3 style={{ color: '#fff', fontWeight: '700' }}>
                  {num === 1 ? 'Fedezd fel a világ zászlóit' : num === 2 ? 'Nemzetközi választék' : 'Elegáns és tartós'}
                </h3>
                <p style={{ color: '#f1f1f1', fontSize: '1rem' }}>
                  {num === 1 ? 'Minőségi zászlók minden nemzet számára, közvetlenül Magyarországról.' : num === 2 ? 'Több mint száz ország zászlója egy helyen – gyűjtőknek és rajongóknak.' : 'Zászlóinkat a legjobb anyagokból készítjük, hogy hosszú ideig kibírják.'}
                </p>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      <div style={{ width: '90%' }}>
        {popularFlags.length > 0 && <FlagSection title="Legnépszerűbb országok zászlói" items={popularFlags} sectionKey="popular" />}
        {euFlags.length > 0 && <FlagSection title="Az Európai Unió országai" items={euFlags} sectionKey="eu" />}
        {otherFlags.length > 0 && <FlagSection title="Egyéb országok" items={otherFlags} sectionKey="other" />}
      </div>
    </div>
  );
};

export default Fooldal;
