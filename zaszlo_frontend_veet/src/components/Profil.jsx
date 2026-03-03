import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import httpCommon from "../http-common";
import {
  IoMdPerson,
  IoMdMail,
  IoMdCall,
  IoMdHome,
  IoMdCreate,
  IoMdCheckmark,
  IoMdClose,
} from "react-icons/io";
import { Container, Row, Col, Card, Badge, Spinner, Form, Button } from "react-bootstrap";

const Profil = ({ accessToken, onUserUpdate }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const authToken = accessToken || localStorage.getItem("token");

  useEffect(() => {
    if (!authToken) {
      navigate("/login");
      return;
    }

    const fetchProfil = async () => {
      try {
        const response = await httpCommon.get("/auth/profil", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        setUserData(response.data.user);
        setFormData(response.data.user || {});
      } catch (error) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfil();
  }, [authToken, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!authToken) {
      navigate("/login");
      return;
    }

    try {
      const payload = {
        nev: formData.nev || "",
        telefonszam: formData.telefonszam || "",
        iranyitoszam: formData.iranyitoszam || "",
        varos: formData.varos || "",
        utca: formData.utca || "",
      };

      const response = await httpCommon.put("/auth/profil/update", payload, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setUserData(response.data.user);
      setFormData(response.data.user || {});
      setEditMode(false);

      if (onUserUpdate) {
        onUserUpdate(response.data.user);
      }

      alert("Adatok sikeresen mentve!");
    } catch (error) {
      console.error("Hiba a menteskor:", error);
      alert("Nem sikerult a mentes.");
    }
  };

  if (loading) {
    return (
      <Container className="py-5 mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Adataid betoltese...</p>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container className="py-5 mt-5 text-center">
        <p className="text-muted">A profil nem erheto el.</p>
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
              <div
                className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center shadow mx-auto mb-3"
                style={{ width: "90px", height: "90px" }}
              >
                <IoMdPerson size={50} />
              </div>
              <h3 className="mb-1 fw-bold">{userData.nev}</h3>
              <Badge bg="light" text="dark" className="rounded-pill px-3 py-2 text-uppercase shadow-sm">
                {userData.jogosultsag || "vasarlo"}
              </Badge>
            </div>

            <Card.Body className="p-4 p-md-5">
              {editMode ? (
                <Form>
                  <h5 className="mb-4 fw-bold border-bottom pb-2">Szemelyes adatok szerkesztese</h5>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Label className="small fw-bold">Teljes nev</Form.Label>
                      <Form.Control name="nev" value={formData.nev || ""} onChange={handleChange} />
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Label className="small fw-bold">Telefonszam</Form.Label>
                      <Form.Control
                        name="telefonszam"
                        placeholder="+36 30 123 4567"
                        value={formData.telefonszam || ""}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col md={4} className="mb-3">
                      <Form.Label className="small fw-bold">Iranyitoszam</Form.Label>
                      <Form.Control name="iranyitoszam" value={formData.iranyitoszam || ""} onChange={handleChange} />
                    </Col>
                    <Col md={8} className="mb-3">
                      <Form.Label className="small fw-bold">Varos</Form.Label>
                      <Form.Control name="varos" value={formData.varos || ""} onChange={handleChange} />
                    </Col>
                    <Col md={12} className="mb-4">
                      <Form.Label className="small fw-bold">Utca, hazszam</Form.Label>
                      <Form.Control name="utca" value={formData.utca || ""} onChange={handleChange} />
                    </Col>
                  </Row>
                  <div className="d-flex gap-2">
                    <Button type="button" variant="success" className="rounded-pill px-4 fw-bold" onClick={handleSave}>
                      <IoMdCheckmark className="me-1" /> Mentes
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      className="rounded-pill px-4"
                      onClick={() => {
                        setEditMode(false);
                        setFormData(userData);
                      }}
                    >
                      <IoMdClose className="me-1" /> Megse
                    </Button>
                  </div>
                </Form>
              ) : (
                <div className="profile-info">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-light p-2 rounded-3 text-primary">
                      <IoMdMail size={24} />
                    </div>
                    <div>
                      <small className="text-muted d-block text-uppercase small fw-bold">Email cim</small>
                      <span className="fs-6 fw-medium">{userData.email}</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-light p-2 rounded-3 text-primary">
                      <IoMdCall size={24} />
                    </div>
                    <div>
                      <small className="text-muted d-block text-uppercase small fw-bold">Telefonszam</small>
                      <span className="fs-6 fw-medium">{userData.telefonszam || <i>Nincs megadva</i>}</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-light p-2 rounded-3 text-primary">
                      <IoMdHome size={24} />
                    </div>
                    <div>
                      <small className="text-muted d-block text-uppercase small fw-bold">Szallitasi cim</small>
                      <span className="fs-6 fw-medium">
                        {userData.varos ? `${userData.iranyitoszam} ${userData.varos}, ${userData.utca}` : <i>Nincs megadva</i>}
                      </span>
                    </div>
                  </div>

                  <div className="d-grid gap-2 mt-5">
                    <Button type="button" variant="primary" className="rounded-pill fw-bold" onClick={() => setEditMode(true)}>
                      Adatok modositasa
                    </Button>
                    <Button type="button" variant="outline-secondary" className="rounded-pill" onClick={() => navigate("/")}>
                      Vissza a kezdolapra
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
