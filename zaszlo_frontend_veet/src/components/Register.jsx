import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import httpCommon from '../http-common.js';
import { Alert, Row, Col } from 'react-bootstrap';

const Register = () => {
  const [formData, setFormData] = useState({
    nev: '',
    email: '',
    telefonszam: '',
    iranyitoszam: '',
    varos: '',
    utca: '',
    jelszo: '',
    confirmJelszo: ''
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.id]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.jelszo !== formData.confirmJelszo) {
      setError("A két jelszó nem egyezik!");
      return;
    }

    try {
      await httpCommon.post("/auth/register", formData);
      alert("Sikeres regisztráció! Most jelentkezz be.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Hiba a regisztráció során");
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8"> {/* Kicsit szélesebb legyen a több mező miatt */}
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5">
              <h3 className="text-center fw-bold mb-4">Regisztráció</h3>
              {error && <Alert variant="danger" className="py-2 small text-center">{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <label className="form-label fw-medium small">Teljes név</label>
                    <input type="text" className="form-control bg-light border-0" id="nev" value={formData.nev} onChange={handleChange} required />
                  </Col>
                  <Col md={6} className="mb-3">
                    <label className="form-label fw-medium small">Email cím</label>
                    <input type="email" className="form-control bg-light border-0" id="email" value={formData.email} onChange={handleChange} required />
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <label className="form-label fw-medium small">Telefonszám</label>
                    <input type="text" className="form-control bg-light border-0" id="telefonszam" placeholder="+36 30 123 4567" value={formData.telefonszam} onChange={handleChange} required />
                  </Col>
                  <Col md={6} className="mb-3">
                    <label className="form-label fw-medium small">Irányítószám</label>
                    <input type="text" className="form-control bg-light border-0" id="iranyitoszam" value={formData.iranyitoszam} onChange={handleChange} required />
                  </Col>
                </Row>

                <Row>
                  <Col md={4} className="mb-3">
                    <label className="form-label fw-medium small">Város</label>
                    <input type="text" className="form-control bg-light border-0" id="varos" value={formData.varos} onChange={handleChange} required />
                  </Col>
                  <Col md={8} className="mb-3">
                    <label className="form-label fw-medium small">Utca, házszám</label>
                    <input type="text" className="form-control bg-light border-0" id="utca" value={formData.utca} onChange={handleChange} required />
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <label className="form-label fw-medium small">Jelszó</label>
                    <input type="password" className="form-control bg-light border-0" id="jelszo" value={formData.jelszo} onChange={handleChange} required />
                  </Col>
                  <Col md={6} className="mb-3">
                    <label className="form-label fw-medium small">Jelszó megerősítése</label>
                    <input type="password" className="form-control bg-light border-0" id="confirmJelszo" value={formData.confirmJelszo} onChange={handleChange} required />
                  </Col>
                </Row>

                <button type="submit" className="btn btn-primary w-100 btn-lg rounded-pill fw-bold shadow-sm mt-3">
                  Regisztráció
                </button>
              </form>
              {/* ... linkek ... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;