import React, { useContext, useState } from 'react';
import { KosarContext } from '../context/KosarContext'; 
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, ListGroup, Alert } from 'react-bootstrap';
import { IoMdArrowBack, IoMdCheckmarkCircleOutline } from "react-icons/io";

const Fizetes = () => {
  // Feltételezzük, hogy a Context átadja a setKosar-t is az ürítéshez
  const { kosar, vegosszeg, setKosar } = useContext(KosarContext);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

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

  const aktualisSzallitasiDij = szallitasiArak[szallitasiMod];
  const aktualisFizetesiDij = fizetesiMod === 'utanvet' ? fizetesiArak.utanvet : 0;
  const veglegesOsszeg = vegosszeg + aktualisSzallitasiDij + aktualisFizetesiDij;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRendeles = async (e) => {
    e.preventDefault();
    if (!token) return; // Biztonsági dupla ellenőrzés

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/szamlak', { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          fizetesiMod: fizetesiMod,
          kosar: kosar
        })
      });

      if (response.status === 401 || response.status === 403) {
         alert("Lejárt vagy érvénytelen munkamenet. Jelentkezz be újra!");
         localStorage.removeItem('token'); // Tisztítás, ha rossz a token
         navigate("/login");
      } else if (response.ok) {
         alert("Sikeres rendelés! Köszönjük a vásárlást!");
         
         // KOSÁR ÜRÍTÉSE SIKER UTÁN
         if (setKosar) setKosar([]); 
         
         navigate("/");
      } else {
         alert("Hiba történt a szerveren a rendelés feldolgozásakor.");
      }
    } catch (error) {
      alert("Hálózati hiba! Ellenőrizd a szerver futását.");
    } finally {
      setLoading(false);
    }
  };

  if (kosar.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h2>A kosarad üres.</h2>
        <Button className="mt-3" onClick={() => navigate("/")}>Vissza a főoldalra</Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Button variant="link" className="text-decoration-none mb-4 ps-0" onClick={() => navigate("/kosar")}>
        <IoMdArrowBack /> Vissza a kosárhoz
      </Button>

      <h2 className="mb-4 fw-bold">Pénztár</h2>

      <Form onSubmit={handleRendeles}>
        <Row>
          <Col lg={8}>
            {/* Szállítási adatok kártya */}
            <Card className="shadow-sm mb-4 border-0">
              <Card.Header className="bg-white fw-bold py-3">1. Szállítási és Számlázási adatok</Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={12}><Form.Label>Teljes név</Form.Label><Form.Control required name="nev" value={formData.nev} onChange={handleInputChange} /></Col>
                  <Col md={6}><Form.Label>Email cím</Form.Label><Form.Control required type="email" name="email" value={formData.email} onChange={handleInputChange} /></Col>
                  <Col md={6}><Form.Label>Telefonszám</Form.Label><Form.Control required name="telefon" value={formData.telefon} onChange={handleInputChange} /></Col>
                  <Col md={4}><Form.Label>Irányítószám</Form.Label><Form.Control required name="iranyitoszam" value={formData.iranyitoszam} onChange={handleInputChange} /></Col>
                  <Col md={8}><Form.Label>Város</Form.Label><Form.Control required name="varos" value={formData.varos} onChange={handleInputChange} /></Col>
                  <Col md={12}><Form.Label>Utca, házszám</Form.Label><Form.Control required name="utca" value={formData.utca} onChange={handleInputChange} /></Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Szállítási mód választó */}
            <Card className="shadow-sm mb-4 border-0">
              <Card.Header className="bg-white fw-bold py-3">2. Szállítási mód</Card.Header>
              <Card.Body>
                {['gls', 'foxpost', 'szemelyes'].map((mod) => (
                  <Form.Check 
                    key={mod}
                    type="radio"
                    id={mod}
                    label={<div className="d-flex justify-content-between w-100">
                      <span>{mod.toUpperCase()} {mod === 'szemelyes' ? 'átvétel' : 'szállítás'}</span>
                      <span className="fw-bold">{szallitasiArak[mod] === 0 ? 'Ingyenes' : `${szallitasiArak[mod]} Ft`}</span>
                    </div>}
                    name="szallitas"
                    className="mb-3"
                    checked={szallitasiMod === mod}
                    onChange={() => setSzallitasiMod(mod)}
                  />
                ))}
              </Card.Body>
            </Card>

            {/* Fizetési mód választó */}
            <Card className="shadow-sm mb-4 border-0">
              <Card.Header className="bg-white fw-bold py-3">3. Fizetési mód</Card.Header>
              <Card.Body>
                <Form.Check type="radio" id="kartya" label="Bankkártyás fizetés" name="fizetes" checked={fizetesiMod === 'kartya'} onChange={() => setFizetesiMod('kartya')} className="mb-3" />
                <Form.Check type="radio" id="utalas" label="Előre utalás" name="fizetes" checked={fizetesiMod === 'utalas'} onChange={() => setFizetesiMod('utalas')} className="mb-3" />
                <Form.Check type="radio" id="utanvet" label={`Utánvét (+${fizetesiArak.utanvet} Ft)`} name="fizetes" checked={fizetesiMod === 'utanvet'} onChange={() => setFizetesiMod('utanvet')} />
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm border-0 sticky-top" style={{ top: "90px" }}>
              <Card.Header className="bg-white fw-bold py-3">Rendelés összesítése</Card.Header>
              <Card.Body>
                <ListGroup variant="flush" className="mb-3 small">
                  {kosar.map((item, idx) => (
                    <ListGroup.Item key={idx} className="d-flex justify-content-between px-0">
                      <div><span className="fw-bold">{item.db}x</span> {item.orszag || item.nev}</div>
                      <span>{(item.ar * item.db).toLocaleString()} Ft</span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                
                <hr />
                <div className="d-flex justify-content-between mb-2"><span className="text-muted">Részösszeg:</span><span>{vegosszeg.toLocaleString()} Ft</span></div>
                <div className="d-flex justify-content-between mb-2"><span className="text-muted">Szállítás:</span><span>{aktualisSzallitasiDij === 0 ? <span className="text-success">Ingyenes</span> : `${aktualisSzallitasiDij} Ft`}</span></div>
                {aktualisFizetesiDij > 0 && <div className="d-flex justify-content-between mb-2"><span className="text-muted">Kezelési költség:</span><span>{aktualisFizetesiDij} Ft</span></div>}
                <hr />
                <div className="d-flex justify-content-between mb-4 fs-5 fw-bold text-primary"><span>Fizetendő:</span><span>{veglegesOsszeg.toLocaleString()} Ft</span></div>

                {/* BEJELENTKEZÉS ELLENŐRZÉSE A GOMB ELŐTT */}
                {token ? (
                  <Button variant="success" size="lg" type="submit" className="w-100 fw-bold" disabled={loading}>
                    {loading ? 'Feldolgozás...' : (
                      <>
                        <IoMdCheckmarkCircleOutline className="me-2" size={24}/>
                        Megrendelés elküldése
                      </>
                    )}
                  </Button>
                ) : (
                  <Alert variant="danger" className="text-center">
                    <p className="mb-2 small fw-bold">Rendeléshez bejelentkezés szükséges!</p>
                    <Button as={Link} to="/login" variant="primary" size="sm" className="w-100">Bejelentkezés</Button>
                  </Alert>
                )}
                
                <div className="text-center mt-3 small text-muted">A gomb megnyomásával elfogadod az ÁSZF-et.</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default Fizetes;