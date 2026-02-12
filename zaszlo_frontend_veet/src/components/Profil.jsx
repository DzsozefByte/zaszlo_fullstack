import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import httpCommon from '../http-common';
import { IoMdPerson, IoMdMail, IoMdCall, IoMdHome, IoMdCreate, IoMdCheckmark, IoMdClose } from "react-icons/io";
import { Container, Row, Col, Card, Badge, Spinner, Form, Button } from 'react-bootstrap';

const Profil = ({ accessToken, onUserUpdate }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
        navigate("/login");
        return;
    }

    const fetchProfil = async () => {
      try {
        const response = await httpCommon.get("/auth/profil", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setUserData(response.data.user);
        setFormData(response.data.user); // Alapadatok betöltése a formba
      } catch (error) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfil();
  }, [accessToken, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      // Itt küldjük el a frissített adatokat a backendnek
      const response = await httpCommon.put("/auth/profil/update", formData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      setUserData(response.data.user);
      setEditMode(false);
      
      // Ha van ilyen propunk, frissítjük a globális user állapotot is (hogy a Header is lássa)
      if (onUserUpdate) onUserUpdate(response.data.user);
      
      alert("Adatok sikeresen mentve!");
    } catch (error) {
      console.error("Hiba a mentéskor:", error);
      alert("Nem sikerült a mentés.");
    }
  };

  if (loading) {
    return (
        <Container className="py-5 mt-5 text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Adataid betöltése...</p>
        </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={7}>
          <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="bg-primary text-white text-center py-5 position-relative">
               {!editMode && (
                 <button 
                   className="btn btn-light btn-sm position-absolute top-0 end-0 m-3 rounded-circle shadow-sm"
                   onClick={() => setEditMode(true)}
                 >
                   <IoMdCreate size={20} />
                 </button>
               )}
               <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center shadow mx-auto mb-3" style={{width: '90px', height: '90px'}}>
                  <IoMdPerson size={50} />
               </div>
               <h3 className="mb-1 fw-bold">{userData?.nev}</h3>
               <Badge bg="light" text="dark" className="rounded-pill px-3 py-2 text-uppercase shadow-sm">
                  {userData?.jogosultsag || 'vásárló'}
               </Badge>
            </div>
            
            <Card.Body className="p-4 p-md-5">
                {editMode ? (
                  <Form>
                    <h5 className="mb-4 fw-bold border-bottom pb-2">Személyes adatok szerkesztése</h5>
                    <Row>
                        <Col md={6} className="mb-3">
                            <Form.Label className="small fw-bold">Teljes név</Form.Label>
                            <Form.Control name="nev" value={formData.nev || ''} onChange={handleChange} />
                        </Col>
                        <Col md={6} className="mb-3">
                            <Form.Label className="small fw-bold">Telefonszám</Form.Label>
                            <Form.Control name="telefonszam" placeholder="+36 30 123 4567" value={formData.telefonszam || ''} onChange={handleChange} />
                        </Col>
                        <Col md={4} className="mb-3">
                            <Form.Label className="small fw-bold">Irányítószám</Form.Label>
                            <Form.Control name="iranyitoszam" value={formData.iranyitoszam || ''} onChange={handleChange} />
                        </Col>
                        <Col md={8} className="mb-3">
                            <Form.Label className="small fw-bold">Város</Form.Label>
                            <Form.Control name="varos" value={formData.varos || ''} onChange={handleChange} />
                        </Col>
                        <Col md={12} className="mb-4">
                            <Form.Label className="small fw-bold">Utca, házszám</Form.Label>
                            <Form.Control name="utca" value={formData.utca || ''} onChange={handleChange} />
                        </Col>
                    </Row>
                    <div className="d-flex gap-2">
                        <Button variant="success" className="rounded-pill px-4 fw-bold" onClick={handleSave}>
                            <IoMdCheckmark className="me-1"/> Mentés
                        </Button>
                        <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => {setEditMode(false); setFormData(userData);}}>
                            <IoMdClose className="me-1"/> Mégse
                        </Button>
                    </div>
                  </Form>
                ) : (
                  <div className="profile-info">
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <div className="bg-light p-2 rounded-3 text-primary"><IoMdMail size={24}/></div>
                        <div>
                            <small className="text-muted d-block text-uppercase small fw-bold">Email cím</small>
                            <span className="fs-6 fw-medium">{userData?.email}</span>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-3 mb-4">
                        <div className="bg-light p-2 rounded-3 text-primary"><IoMdCall size={24}/></div>
                        <div>
                            <small className="text-muted d-block text-uppercase small fw-bold">Telefonszám</small>
                            <span className="fs-6 fw-medium">{userData?.telefonszam || <i>Nincs megadva</i>}</span>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-3 mb-4">
                        <div className="bg-light p-2 rounded-3 text-primary"><IoMdHome size={24}/></div>
                        <div>
                            <small className="text-muted d-block text-uppercase small fw-bold">Szállítási cím</small>
                            <span className="fs-6 fw-medium">
                                {userData?.varos ? `${userData.iranyitoszam} ${userData.varos}, ${userData.utca}` : <i>Nincs megadva</i>}
                            </span>
                        </div>
                    </div>

                    <div className="d-grid gap-2 mt-5">
                        <Button variant="primary" className="rounded-pill fw-bold" onClick={() => setEditMode(true)}>
                            Adatok módosítása
                        </Button>
                        <Button variant="outline-secondary" className="rounded-pill" onClick={() => navigate("/")}>
                            Vissza a kezdőlapra
                        </Button>
                    </div>
                  </div>
                )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profil;