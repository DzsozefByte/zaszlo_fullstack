import React, { useContext } from "react";
import { KosarContext } from "../context/KosarContext";
import { Button, Card, Table, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { IoMdTrash, IoMdAdd, IoMdRemove, IoMdCart, IoMdCloseCircle } from "react-icons/io";

const Kosar = ({ accessToken }) => {
  const { kosar, torlesKosarbol, dbModositas, vegosszeg, setKosar } = useContext(KosarContext);
  const navigate = useNavigate();
  const isLoggedIn = Boolean(accessToken || localStorage.getItem("token"));

  const handleKosarUrites = () => {
    if (window.confirm("Biztosan ki szeretned uriteni a teljes kosarat?")) {
      setKosar([]);
    }
  };

  const handleTovabbPenztarhoz = () => {
    if (!isLoggedIn) {
      alert("A rendeles leadasahoz be kell jelentkezned.");
      navigate("/login");
      return;
    }

    navigate("/fizetes");
  };

  if (kosar.length === 0) {
    return (
      <Container className="py-5 mt-4 mt-md-5 text-center">
        <div className="mb-4">
          <IoMdCart size={80} className="text-light bg-secondary p-3 rounded-circle opacity-50" />
        </div>
        <h2 className="fw-bold">A kosarad jelenleg ures</h2>
        <p className="text-muted">Nezz szet a kinalatunkban es valaszd ki kedvenc zaszloidat!</p>
        <Button variant="primary" size="lg" className="mt-3 rounded-pill px-5 shadow-sm" onClick={() => navigate("/")}>
          Vasarlas megkezdese
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4 py-md-5">
      <div className="d-flex justify-content-between align-items-center mb-4 kosar-title-wrap">
        <h2 className="fw-bold d-flex align-items-center gap-2 m-0">
          <IoMdCart /> Kosar tartalma
        </h2>
        <Button variant="outline-danger" size="sm" onClick={handleKosarUrites} className="rounded-pill">
          <IoMdCloseCircle className="me-1" /> Kosar uritese
        </Button>
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <Table responsive hover className="align-middle mb-0 d-none d-md-table">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">Termek</th>
                  <th className="border-0 py-3">Reszletek</th>
                  <th className="border-0 py-3 text-center">Mennyiseg</th>
                  <th className="border-0 py-3">Osszesen</th>
                  <th className="border-0 py-3 text-end px-4"></th>
                </tr>
              </thead>
              <tbody>
                {kosar.map((item) => (
                  <tr key={`${item.id}-${item.meret}-${item.anyag}`}>
                    <td className="px-4 py-3" style={{ width: "120px" }}>
                      <img
                        src={item.kep}
                        alt={item.orszag}
                        className="shadow-sm"
                        style={{ width: "80px", height: "auto", borderRadius: "8px", objectFit: "cover" }}
                      />
                    </td>
                    <td className="py-3">
                      <div className="fw-bold text-dark">{item.orszag}</div>
                      <div className="text-muted small">
                        {item.meret} | {item.anyag}
                      </div>
                      <div className="text-primary fw-medium d-lg-none">{item.ar.toLocaleString()} Ft</div>
                    </td>
                    <td className="py-3">
                      <div
                        className="d-flex align-items-center justify-content-center border rounded-pill py-1 px-2 mx-auto"
                        style={{ width: "fit-content" }}
                      >
                        <button
                          className="btn btn-link btn-sm text-dark p-0"
                          onClick={() => dbModositas(item.id, item.meret, item.anyag, -1)}
                        >
                          <IoMdRemove />
                        </button>
                        <span className="mx-3 fw-bold">{item.db}</span>
                        <button
                          className="btn btn-link btn-sm text-dark p-0"
                          onClick={() => dbModositas(item.id, item.meret, item.anyag, 1)}
                        >
                          <IoMdAdd />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 fw-bold text-dark">{(item.ar * item.db).toLocaleString()} Ft</td>
                    <td className="py-3 text-end px-4">
                      <button
                        className="btn btn-outline-danger btn-sm rounded-circle border-0"
                        onClick={() => torlesKosarbol(item.id, item.meret, item.anyag)}
                      >
                        <IoMdTrash size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="d-md-none p-3">
              {kosar.map((item) => (
                <Card key={`mobile-${item.id}-${item.meret}-${item.anyag}`} className="border-0 shadow-sm mb-3 rounded-4">
                  <Card.Body className="p-3">
                    <div className="d-flex gap-3 align-items-start">
                      <img
                        src={item.kep}
                        alt={item.orszag}
                        style={{ width: "74px", height: "52px", borderRadius: "8px", objectFit: "cover" }}
                      />
                      <div className="flex-grow-1">
                        <div className="fw-bold">{item.orszag}</div>
                        <div className="text-muted small mb-2">
                          {item.meret} | {item.anyag}
                        </div>
                        <div className="fw-semibold text-primary">{(item.ar * item.db).toLocaleString()} Ft</div>
                      </div>
                      <button
                        className="btn btn-outline-danger btn-sm rounded-circle border-0"
                        onClick={() => torlesKosarbol(item.id, item.meret, item.anyag)}
                      >
                        <IoMdTrash size={18} />
                      </button>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                      <small className="text-muted">Ar/db: {item.ar.toLocaleString()} Ft</small>
                      <div className="d-flex align-items-center border rounded-pill py-1 px-2">
                        <button
                          className="btn btn-link btn-sm text-dark p-0"
                          onClick={() => dbModositas(item.id, item.meret, item.anyag, -1)}
                        >
                          <IoMdRemove />
                        </button>
                        <span className="mx-2 fw-bold">{item.db}</span>
                        <button
                          className="btn btn-link btn-sm text-dark p-0"
                          onClick={() => dbModositas(item.id, item.meret, item.anyag, 1)}
                        >
                          <IoMdAdd />
                        </button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 kosar-summary-card" style={{ top: "100px" }}>
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4">Osszesites</h5>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Termekek osszesen:</span>
                <span className="fw-medium">{vegosszeg.toLocaleString()} Ft</span>
              </div>
              <div className="d-flex justify-content-between mb-4">
                <span className="text-muted">Szallitas:</span>
                <span className="text-success fw-medium">Ingyenes</span>
              </div>
              <hr className="opacity-10" />
              <div className="d-flex justify-content-between mb-4 mt-2">
                <span className="fs-5 fw-bold">Fizetendo:</span>
                <span className="fs-5 fw-bold text-primary">{vegosszeg.toLocaleString()} Ft</span>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-100 rounded-pill fw-bold shadow-sm mb-3"
                onClick={handleTovabbPenztarhoz}
              >
                Tovabb a penztarhoz
              </Button>
              <Button variant="link" className="w-100 text-decoration-none text-muted small" onClick={() => navigate("/")}>
                Vasarlas folytatasa
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Kosar;
