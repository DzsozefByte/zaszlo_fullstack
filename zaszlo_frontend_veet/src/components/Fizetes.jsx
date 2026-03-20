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
  const [fizetesiModok, setFizetesiModok] = useState([]);

  const [rendelesAdatok, setRendelesAdatok] = useState({
    nev: user?.nev || "",
    email: user?.email || "",
    telefonszam: user?.telefonszam || "",
    iranyitoszam: user?.iranyitoszam || "",
    varos: user?.varos || "",
    utca: user?.utca || "",
    adoszam: user?.adoszam || "",
    fizetesiModId: "",
  });

  useEffect(() => {
    if (user) {
      setRendelesAdatok((prev) => ({
        ...prev,
        nev: user.nev || prev.nev,
        email: user.email || prev.email,
        telefonszam: user.telefonszam || prev.telefonszam,
        iranyitoszam:
          user.iranyitoszam === null || user.iranyitoszam === undefined
            ? prev.iranyitoszam
            : String(user.iranyitoszam),
        varos: user.varos ?? prev.varos,
        utca: user.utca ?? prev.utca,
        adoszam: user.adoszam ?? prev.adoszam,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!authToken) {
      alert("Rendelés leadásához jelentkezz be.");
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
          nev: profile.nev ?? prev.nev,
          email: profile.email ?? prev.email,
          telefonszam: profile.telefonszam ?? prev.telefonszam,
          iranyitoszam:
            profile.iranyitoszam === null || profile.iranyitoszam === undefined
              ? prev.iranyitoszam
              : String(profile.iranyitoszam),
          varos: profile.varos ?? prev.varos,
          utca: profile.utca ?? prev.utca,
          adoszam: profile.adoszam ?? prev.adoszam,
        }));
      } catch (error) {
        if (error.response?.status === 401) {
          alert("A rendeléshez újra be kell jelentkezned.");
          navigate("/login");
        }
      }
    };

    fetchProfil();
  }, [authToken, navigate]);

  useEffect(() => {
    const fetchFizetesiModok = async () => {
      try {
        const response = await httpCommon.get("/szamlak/payment-methods", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const methods = Array.isArray(response.data) ? response.data : [];
        setFizetesiModok(methods);

        setRendelesAdatok((prev) => {
          const isSelectedStillValid = methods.some(
            (item) => String(item.id) === String(prev.fizetesiModId)
          );
          return {
            ...prev,
            fizetesiModId: isSelectedStillValid ? prev.fizetesiModId : String(methods[0]?.id || ""),
          };
        });
      } catch {
        setFizetesiModok([]);
      }
    };

    if (authToken) {
      fetchFizetesiModok();
    }
  }, [authToken]);

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
      alert("Rendelés leadásához jelentkezz be.");
      navigate("/login");
      return;
    }

    setLoading(true);

    const selectedPaymentMethod = fizetesiModok.find(
      (item) => String(item.id) === String(rendelesAdatok.fizetesiModId)
    );

    if (!selectedPaymentMethod) {
      alert("Válassz érvényes fizetési módot.");
      setLoading(false);
      return;
    }

    const vegsoRendeles = {
      fizetesiModId: Number(rendelesAdatok.fizetesiModId),
      fizetesiMod: selectedPaymentMethod.nev,
      kosar,
      szallitasiAdatok: {
        nev: rendelesAdatok.nev,
        email: rendelesAdatok.email,
        iranyitoszam: rendelesAdatok.iranyitoszam,
        varos: rendelesAdatok.varos,
        utca: rendelesAdatok.utca,
        telefon: rendelesAdatok.telefonszam,
        adoszam: rendelesAdatok.adoszam,
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
        alert("A rendelés leadásához be kell jelentkezned.");
        navigate("/login");
        return;
      }

      alert("Hiba történt a rendelés feldolgozásakor. Próbáld újra.");
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
        <h2 className="fw-bold">Köszönjük a vásárlást!</h2>
        <p className="text-muted fs-5">Rendelésedet rögzítettük, hamarosan feldolgozzuk.</p>
        <Button variant="primary" size="lg" className="mt-4 rounded-pill px-5" onClick={() => navigate("/")}>
          Vissza a főoldalra
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4 d-flex align-items-center gap-2">
        <IoMdCash className="text-primary" /> Pénztár
      </h2>

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          <Col lg={7}>
            <Card className="border-0 shadow-sm rounded-4 p-3">
              <Card.Body>
                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                  <IoMdPin className="text-primary" /> Szállítási adatok
                </h5>

                <Row>
                  <Col md={12} className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Teljes név</Form.Label>
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
                    <Form.Label className="small fw-bold text-muted">Email cím</Form.Label>
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
                    <Form.Label className="small fw-bold text-muted">Telefonszám</Form.Label>
                    <Form.Control
                      required
                      name="telefonszam"
                      value={rendelesAdatok.telefonszam}
                      onChange={handleInputChange}
                      placeholder="+36 30 123 4567"
                      className="rounded-3"
                    />
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Adószám (opcionális)</Form.Label>
                    <Form.Control
                      name="adoszam"
                      value={rendelesAdatok.adoszam}
                      onChange={handleInputChange}
                      className="rounded-3"
                    />
                  </Col>

                  <Col md={4} className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Irányítószám</Form.Label>
                    <Form.Control
                      required
                      name="iranyitoszam"
                      value={rendelesAdatok.iranyitoszam}
                      onChange={handleInputChange}
                      className="rounded-3"
                    />
                  </Col>

                  <Col md={8} className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Város</Form.Label>
                    <Form.Control
                      required
                      name="varos"
                      value={rendelesAdatok.varos}
                      onChange={handleInputChange}
                      className="rounded-3"
                    />
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Utca, házszám, emelet/ajtó</Form.Label>
                    <Form.Control
                      required
                      name="utca"
                      value={rendelesAdatok.utca}
                      onChange={handleInputChange}
                      className="rounded-3"
                    />
                  </Col>
                </Row>

                <h5 className="fw-bold mt-4 mb-3">Fizetési mód</h5>
                <div className="d-flex flex-column gap-2">
                  {fizetesiModok.map((item) => (
                    <Form.Check
                      key={item.id}
                      type="radio"
                      label={item.nev}
                      name="fizetesiModId"
                      value={String(item.id)}
                      checked={String(rendelesAdatok.fizetesiModId) === String(item.id)}
                      onChange={handleInputChange}
                    />
                  ))}
                  {!fizetesiModok.length && (
                    <div className="text-danger small">Jelenleg nincs elérhető fizetési mód.</div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <Card
              className="border-0 shadow-sm rounded-4 checkout-summary-card"
              style={{ position: "sticky", top: "100px", zIndex: 1 }}
            >
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                  <IoMdCart /> Rendelésed
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
                  <span className="text-muted">Részösszeg:</span>
                    <span>{vegosszeg.toLocaleString()} Ft</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
                    <span className="text-muted">Szállítás:</span>
                    <span className="text-success fw-bold">Ingyenes</span>
                  </ListGroup.Item>
                  <hr />
                  <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
                    <span className="fs-5 fw-bold">Fizetendő:</span>
                    <span className="fs-5 fw-bold text-primary">{vegosszeg.toLocaleString()} Ft</span>
                  </ListGroup.Item>
                </ListGroup>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 rounded-pill fw-bold shadow py-3"
                  disabled={loading || !fizetesiModok.length || !rendelesAdatok.fizetesiModId}
                >
                  {loading ? "Feldolgozás..." : "Rendelés véglegesítése"}
                </Button>
                <p className="text-center text-muted small mt-3">
                  A "Rendelés véglegesítése" gombra kattintva elfogadod az ÁSZF-et.
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
