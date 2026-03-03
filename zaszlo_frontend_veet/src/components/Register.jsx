import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import httpCommon from "../http-common.js";
import { Alert, Row, Col } from "react-bootstrap";

const Register = () => {
  const [formData, setFormData] = useState({
    nev: "",
    email: "",
    telefonszam: "",
    iranyitoszam: "",
    varos: "",
    utca: "",
    jelszo: "",
    confirmJelszo: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.jelszo !== formData.confirmJelszo) {
      setError("A ket jelszo nem egyezik!");
      return;
    }

    try {
      await httpCommon.post("/auth/register", formData);
      alert("Sikeres regisztracio! Most jelentkezz be.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Hiba a regisztracio soran");
    }
  };

  return (
    <div className="container py-4 py-md-5 auth-page">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-9 col-xl-8">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-3 p-sm-4 p-md-5">
              <h3 className="text-center fw-bold mb-4">Regisztracio</h3>
              {error && <Alert variant="danger" className="py-2 small text-center">{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <label className="form-label fw-medium small">Teljes nev</label>
                    <input
                      type="text"
                      className="form-control bg-light border-0"
                      id="nev"
                      value={formData.nev}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <label className="form-label fw-medium small">Email cim</label>
                    <input
                      type="email"
                      className="form-control bg-light border-0"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <label className="form-label fw-medium small">Telefonszam</label>
                    <input
                      type="text"
                      className="form-control bg-light border-0"
                      id="telefonszam"
                      placeholder="+36 30 123 4567"
                      value={formData.telefonszam}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <label className="form-label fw-medium small">Iranyitoszam</label>
                    <input
                      type="text"
                      className="form-control bg-light border-0"
                      id="iranyitoszam"
                      value={formData.iranyitoszam}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={4} className="mb-3">
                    <label className="form-label fw-medium small">Varos</label>
                    <input
                      type="text"
                      className="form-control bg-light border-0"
                      id="varos"
                      value={formData.varos}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                  <Col md={8} className="mb-3">
                    <label className="form-label fw-medium small">Utca, hazszam</label>
                    <input
                      type="text"
                      className="form-control bg-light border-0"
                      id="utca"
                      value={formData.utca}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <label className="form-label fw-medium small">Jelszo</label>
                    <input
                      type="password"
                      className="form-control bg-light border-0"
                      id="jelszo"
                      value={formData.jelszo}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <label className="form-label fw-medium small">Jelszo megerositese</label>
                    <input
                      type="password"
                      className="form-control bg-light border-0"
                      id="confirmJelszo"
                      value={formData.confirmJelszo}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                </Row>

                <button type="submit" className="btn btn-primary w-100 btn-lg rounded-pill fw-bold shadow-sm mt-3">
                  Regisztracio
                </button>
              </form>

              <hr className="my-4 text-muted" />

              <div className="text-center">
                <p className="mb-0 text-muted small">Mar van fiokod?</p>
                <Link to="/login" className="fw-bold text-decoration-none">
                  Bejelentkezes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
