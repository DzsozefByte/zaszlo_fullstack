import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Form, Button, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { KosarContext } from "../context/KosarContext";
import { IoMdCart, IoMdCash, IoMdPin, IoMdCheckmarkCircle } from "react-icons/io";
import httpCommon from "../http-common";

const Fizetes = ({ user, accessToken }) => {
  const { kosar, vegosszeg, setKosar } = useContext(KosarContext);
  const navigate = useNavigate();
  const authToken = accessToken || localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [rendelesSikeres, setRendelesSikeres] = useState(false);

  const [rendelesAdatok, setRendelesAdatok] = useState({
    nev: user?.nev || "",
    email: user?.email || "",
    telefonszam: user?.telefonszam || "",
    iranyitoszam: user?.iranyitoszam || "",
    varos: user?.varos || "",
    utca: user?.utca || "",
    fizetesiMod: "utanvet",
    megjegyzes: "",
  });

  useEffect(() => {
    if (user) {
      setRendelesAdatok((prev) => ({
        ...prev,
        nev: user.nev || prev.nev,
        email: user.email || prev.email,
        telefonszam: user.telefonszam || prev.telefonszam,
        iranyitoszam: user.iranyitoszam || prev.iranyitoszam,
        varos: user.varos || prev.varos,
        utca: user.utca || prev.utca,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!authToken) {
      alert("Rendeles leadasahoz jelentkezz be.");
      navigate("/login");
      return;
    }

    const fetchProfil = async () => {
      try {
        const response = await httpCommon.get("/auth/profil", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const profile = response.data?.user || {};

        setRendelesAdatok((prev) => ({
          ...prev,
          nev: profile.nev || prev.nev,
          email: profile.email || prev.email,
          telefonszam: profile.telefonszam || prev.telefonszam,
          iranyitoszam: profile.iranyitoszam || prev.iranyitoszam,
          varos: profile.varos || prev.varos,
          utca: profile.utca || prev.utca,
        }));
      } catch (error) {
        if (error.response?.status === 401) {
          alert("A rendeleshez ujra be kell jelentkezned.");
          navigate("/login");
        }
      }
    };

    fetchProfil();
  }, [authToken, navigate]);

  useEffect(() => {
    if (kosar.length === 0 && !rendelesSikeres) {
      navigate("/kosar");
    }
  }, [kosar, navigate, rendelesSikeres]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRendelesAdatok((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!authToken) {
      alert("Rendeles leadasahoz jelentkezz be.");
      navigate("/login");
      return;
    }

    setLoading(true);

    const vegsoRendeles = {
      fizetesiMod: rendelesAdatok.fizetesiMod,
      kosar,
      szallitasiAdatok: {
        nev: rendelesAdatok.nev,
        email: rendelesAdatok.email,
        iranyitoszam: rendelesAdatok.iranyitoszam,
        varos: rendelesAdatok.varos,
        utca: rendelesAdatok.utca,
        telefon: rendelesAdatok.telefonszam,
      },
    };

    try {
      await httpCommon.post("/szamlak", vegsoRendeles, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setRendelesSikeres(true);
      setKosar([]);
    } catch (error) {
      console.error("Hiba a rendeles soran:", error);

      if (error.response?.status === 401) {
        alert("A rendeles leadasahoz be kell jelentkezned.");
        navigate("/login");
        return;
      }

      alert("Hiba tortent a rendeles feldolgozasakor. Probald ujra.");
    } finally {
      setLoading(false);
    }
  };

  if (!authToken) {
    return null;
  }

  if (rendelesSikeres) {
    return (
      <Container className="py-5 text-center animate-slide-up">
        <div className="mb-4 text-success">
          <IoMdCheckmarkCircle size={100} />
        </div>
        <h2 className="fw-bold">Koszonjuk a vasarlast!</h2>
        <p className="text-muted fs-5">Rendelesedet rogzitettuk, hamarosan kuldjuk a visszaigazolo e-mailt.</p>
        <Button variant="primary" size="lg" className="mt-4 rounded-pill px-5" onClick={() => navigate("/")}>
          Vissza a fooldalra
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4 d-flex align-items-center gap-2">
        <IoMdCash className="text-primary" /> Penztar
      </h2>

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          <Col lg={7}>
            <Card className="border-0 shadow-sm rounded-4 p-3">
              <Card.Body>
                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                  <IoMdPin className="text-primary" /> Szallitasi adatok
                </h5>

                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Teljes nev</Form.Label>
                    <Form.Control
                      required
                      name="nev"
                      value={rendelesAdatok.nev}
                      onChange={handleInputChange}
                      placeholder="Minta Janos"
                      className="rounded-3"
                    />
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Email cim</Form.Label>
                    <Form.Control
                      required
                      type="email"
                      name="email"
                      value={rendelesAdatok.email}
                      onChange={handleInputChange}
                      placeholder="minta@email.hu"
                      className="rounded-3"
                    />
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Telefonszam</Form.Label>
                    <Form.Control
                      required
                      name="telefonszam"
                      value={rendelesAdatok.telefonszam}
                      onChange={handleInputChange}
                      placeholder="+36 30 123 4567"
                      className="rounded-3"
                    />
                  </Col>

                  <Col md={4} className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Iranyitoszam</Form.Label>
                    <Form.Control
                      required
                      name="iranyitoszam"
                      value={rendelesAdatok.iranyitoszam}
                      onChange={handleInputChange}
                      className="rounded-3"
                    />
                  </Col>

                  <Col md={8} className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Varos</Form.Label>
                    <Form.Control
                      required
                      name="varos"
                      value={rendelesAdatok.varos}
                      onChange={handleInputChange}
                      className="rounded-3"
                    />
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Utca, hazszam, emelet/ajto</Form.Label>
                    <Form.Control
                      required
                      name="utca"
                      value={rendelesAdatok.utca}
                      onChange={handleInputChange}
                      className="rounded-3"
                    />
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Megjegyzes (opcionalis)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="megjegyzes"
                      value={rendelesAdatok.megjegyzes}
                      onChange={handleInputChange}
                      placeholder="Pl. a kapucsengo nem jo..."
                      className="rounded-3"
                    />
                  </Col>
                </Row>

                <h5 className="fw-bold mt-4 mb-3">Fizetesi mod</h5>
                <div className="d-flex flex-column gap-2">
                  <Form.Check
                    type="radio"
                    label="Utanvet (fizetes a futarnal)"
                    name="fizetesiMod"
                    value="utanvet"
                    checked={rendelesAdatok.fizetesiMod === "utanvet"}
                    onChange={handleInputChange}
                  />
                  <Form.Check
                    type="radio"
                    label="Bankkartyas fizetes"
                    name="fizetesiMod"
                    value="kartya"
                    checked={rendelesAdatok.fizetesiMod === "kartya"}
                    onChange={handleInputChange}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="border-0 shadow-sm rounded-4 sticky-top" style={{ top: "100px" }}>
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                  <IoMdCart /> Rendelesed
                </h5>

                <div className="mb-4" style={{ maxHeight: "250px", overflowY: "auto" }}>
                  {kosar.map((item) => (
                    <div
                      key={`${item.id}-${item.meret}`}
                      className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <img src={item.kep} alt="" style={{ width: "40px", borderRadius: "4px" }} />
                        <div>
                          <div className="small fw-bold">{item.orszag}</div>
                          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                            {item.db} db | {item.meret}
                          </div>
                        </div>
                      </div>
                      <div className="small fw-bold">{(item.ar * item.db).toLocaleString()} Ft</div>
                    </div>
                  ))}
                </div>

                <ListGroup variant="flush" className="mb-4">
                  <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
                    <span className="text-muted">Reszosszeg:</span>
                    <span>{vegosszeg.toLocaleString()} Ft</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
                    <span className="text-muted">Szallitas:</span>
                    <span className="text-success fw-bold">Ingyenes</span>
                  </ListGroup.Item>
                  <hr />
                  <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
                    <span className="fs-5 fw-bold">Fizetendo:</span>
                    <span className="fs-5 fw-bold text-primary">{vegosszeg.toLocaleString()} Ft</span>
                  </ListGroup.Item>
                </ListGroup>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 rounded-pill fw-bold shadow py-3"
                  disabled={loading}
                >
                  {loading ? "Feldolgozas..." : "Rendeles veglegesitese"}
                </Button>
                <p className="text-center text-muted small mt-3">
                  A "Rendeles veglegesitese" gombra kattintva elfogadod az ASZF-et.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default Fizetes;
