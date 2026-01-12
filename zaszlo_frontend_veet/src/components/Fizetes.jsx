import React, { useContext, useState } from 'react';
import { KosarContext } from '../context/KosarContext'; 
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, ListGroup, Badge } from 'react-bootstrap';
import { IoMdArrowBack, IoMdCheckmarkCircleOutline } from "react-icons/io";

const Fizetes = () => {
  const { kosar, vegosszeg } = useContext(KosarContext);
  const navigate = useNavigate();

  // Űrlap állapotok
  const [formData, setFormData] = useState({
    nev: '',
    email: '',
    telefon: '',
    iranyitoszam: '',
    varos: '',
    utca: ''
  });

  const [szallitasiMod, setSzallitasiMod] = useState('gls');
  const [fizetesiMod, setFizetesiMod] = useState('kartya');
  const [loading, setLoading] = useState(false);

  // Árak definíciója
  const szallitasiArak = {
    gls: 1990,
    foxpost: 1290,
    szemelyes: 0
  };

  const fizetesiArak = {
    utanvet: 490,
    kartya: 0,
    utalas: 0
  };

  // Végösszeg kalkuláció (Termékek + Szállítás + Fizetési kezelési ktsg)
  const aktualisSzallitasiDij = szallitasiArak[szallitasiMod];
  const aktualisFizetesiDij = fizetesiMod === 'utanvet' ? fizetesiArak.utanvet : 0;
  const veglegesOsszeg = vegosszeg + aktualisSzallitasiDij + aktualisFizetesiDij;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRendeles = (e) => {
    e.preventDefault();
    setLoading(true);

    // Itt küldenéd el az adatokat a szervernek (API hívás)
    setTimeout(() => {
      alert("Sikeres rendelés! Köszönjük a vásárlást.");
      setLoading(false);
      // Itt érdemes lenne kiüríteni a kosarat: clearKosar()
      navigate("/"); // Visszairányítás a főoldalra
    }, 2000);
  };

  if (kosar.length === 0) {
    navigate("/");
    return null;
  }

  return (
    <Container className="py-5">
      <Button variant="link" className="text-decoration-none mb-4 ps-0" onClick={() => navigate("/kosar")}>
        <IoMdArrowBack /> Vissza a kosárhoz
      </Button>

      <h2 className="mb-4 fw-bold">Pénztár</h2>

      <Form onSubmit={handleRendeles}>
        <Row>
          {/* BAL OSZLOP: ADATOK */}
          <Col lg={8}>
            
            {/* 1. Szállítási adatok */}
            <Card className="shadow-sm mb-4 border-0">
              <Card.Header className="bg-white fw-bold py-3">1. Szállítási és Számlázási adatok</Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Label>Teljes név</Form.Label>
                    <Form.Control required type="text" name="nev" value={formData.nev} onChange={handleInputChange} placeholder="Pl. Kiss János" />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Email cím</Form.Label>
                    <Form.Control required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="pelda@email.com" />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Telefonszám</Form.Label>
                    <Form.Control required type="tel" name="telefon" value={formData.telefon} onChange={handleInputChange} placeholder="+36 30 123 4567" />
                  </Col>
                  <Col md={4}>
                    <Form.Label>Irányítószám</Form.Label>
                    <Form.Control required type="text" name="iranyitoszam" value={formData.iranyitoszam} onChange={handleInputChange} />
                  </Col>
                  <Col md={8}>
                    <Form.Label>Város</Form.Label>
                    <Form.Control required type="text" name="varos" value={formData.varos} onChange={handleInputChange} />
                  </Col>
                  <Col md={12}>
                    <Form.Label>Utca, házszám</Form.Label>
                    <Form.Control required type="text" name="utca" value={formData.utca} onChange={handleInputChange} />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* 2. Szállítási mód */}
            <Card className="shadow-sm mb-4 border-0">
              <Card.Header className="bg-white fw-bold py-3">2. Szállítási mód</Card.Header>
              <Card.Body>
                <Form.Check 
                  type="radio"
                  id="gls"
                  label={<div className="d-flex justify-content-between w-100"><span>GLS Házhozszállítás</span><span className="fw-bold">{szallitasiArak.gls} Ft</span></div>}
                  name="szallitas"
                  className="mb-3 custom-radio"
                  checked={szallitasiMod === 'gls'}
                  onChange={() => setSzallitasiMod('gls')}
                />
                <Form.Check 
                  type="radio"
                  id="foxpost"
                  label={<div className="d-flex justify-content-between w-100"><span>Foxpost Csomagautomata</span><span className="fw-bold">{szallitasiArak.foxpost} Ft</span></div>}
                  name="szallitas"
                  className="mb-3 custom-radio"
                  checked={szallitasiMod === 'foxpost'}
                  onChange={() => setSzallitasiMod('foxpost')}
                />
                <Form.Check 
                  type="radio"
                  id="szemelyes"
                  label={<div className="d-flex justify-content-between w-100"><span>Személyes átvétel (Budapest)</span><span className="text-success fw-bold">Ingyenes</span></div>}
                  name="szallitas"
                  className="custom-radio"
                  checked={szallitasiMod === 'szemelyes'}
                  onChange={() => setSzallitasiMod('szemelyes')}
                />
              </Card.Body>
            </Card>

            {/* 3. Fizetési mód */}
            <Card className="shadow-sm mb-4 border-0">
              <Card.Header className="bg-white fw-bold py-3">3. Fizetési mód</Card.Header>
              <Card.Body>
                <Form.Check 
                  type="radio"
                  id="kartya"
                  label="Bankkártyás fizetés (SimplePay)"
                  name="fizetes"
                  className="mb-3"
                  checked={fizetesiMod === 'kartya'}
                  onChange={() => setFizetesiMod('kartya')}
                />
                <Form.Check 
                  type="radio"
                  id="utalas"
                  label="Előre utalás"
                  name="fizetes"
                  className="mb-3"
                  checked={fizetesiMod === 'utalas'}
                  onChange={() => setFizetesiMod('utalas')}
                />
                <Form.Check 
                  type="radio"
                  id="utanvet"
                  label={<div className="d-flex justify-content-between w-100"><span>Utánvét (Fizetés átvételkor)</span><span className="text-muted">+ {fizetesiArak.utanvet} Ft</span></div>}
                  name="fizetes"
                  className=""
                  checked={fizetesiMod === 'utanvet'}
                  onChange={() => setFizetesiMod('utanvet')}
                />
              </Card.Body>
            </Card>
          </Col>

          {/* JOBB OSZLOP: ÖSSZESÍTÉS */}
          <Col lg={4}>
            <Card className="shadow-sm border-0 sticky-top" style={{ top: "90px" }}>
              <Card.Header className="bg-white fw-bold py-3">Rendelés összesítése</Card.Header>
              <Card.Body>
                <ListGroup variant="flush" className="mb-3 small">
                  {kosar.map((item) => (
                    <ListGroup.Item key={`${item.id}-${item.meret}`} className="d-flex justify-content-between align-items-center px-0">
                      <div>
                        <span className="fw-bold">{item.db}x</span> {item.orszag} zászló ({item.meret})
                      </div>
                      <span>{(item.ar * item.db).toLocaleString()} Ft</span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                
                <hr />

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Részösszeg:</span>
                  <span>{vegosszeg.toLocaleString()} Ft</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Szállítás:</span>
                  <span>{aktualisSzallitasiDij === 0 ? <span className="text-success">Ingyenes</span> : `${aktualisSzallitasiDij} Ft`}</span>
                </div>
                {aktualisFizetesiDij > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Kezelési költség:</span>
                    <span>{aktualisFizetesiDij} Ft</span>
                  </div>
                )}

                <hr />

                <div className="d-flex justify-content-between mb-4 fs-5 fw-bold text-primary">
                  <span>Fizetendő:</span>
                  <span>{veglegesOsszeg.toLocaleString()} Ft</span>
                </div>

                <Button variant="success" size="lg" type="submit" className="w-100 fw-bold" disabled={loading}>
                  {loading ? 'Feldolgozás...' : (
                    <>
                      <IoMdCheckmarkCircleOutline className="me-2" size={24}/>
                      Megrendelés elküldése
                    </>
                  )}
                </Button>
                
                <div className="text-center mt-3 small text-muted">
                  A "Megrendelés elküldése" gomb megnyomásával elfogadod az Általános Szerződési Feltételeket.
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default Fizetes;