import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import httpCommon from '../http-common.js';
import { Alert } from 'react-bootstrap';

const Register = () => {
  const [formData, setFormData] = useState({
    nev: '',
    email: '',
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
      await httpCommon.post(
        "/auth/register",
        { nev: formData.nev, email: formData.email, jelszo: formData.jelszo },
        { withCredentials: true } 
      );
      alert("Sikeres regisztráció! Most jelentkezz be.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Hiba a regisztráció során");
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5">
              <h3 className="text-center fw-bold mb-4">Regisztráció</h3>
              
              {error && <Alert variant="danger" className="py-2 small text-center">{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-medium small">Teljes név</label>
                  <input type="text" className="form-control form-control-lg bg-light border-0" id="nev" placeholder="Kovács János" value={formData.nev} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium small">Email cím</label>
                  <input type="email" className="form-control form-control-lg bg-light border-0" id="email" placeholder="pelda@email.com" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium small">Jelszó</label>
                    <input type="password" className="form-control form-control-lg bg-light border-0" id="jelszo" placeholder="********" value={formData.jelszo} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium small">Jelszó megerősítése</label>
                    <input type="password" className="form-control form-control-lg bg-light border-0" id="confirmJelszo" placeholder="********" value={formData.confirmJelszo} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-check mb-4">
                  <input className="form-check-input" type="checkbox" id="terms" required />
                  <label className="form-check-label small text-muted" htmlFor="terms">
                    Elfogadom az <Link to="/aszf" className="text-decoration-none">Általános Szerződési Feltételeket</Link>.
                  </label>
                </div>

                <button type="submit" className="btn btn-primary w-100 btn-lg rounded-pill fw-bold shadow-sm">
                  Regisztráció
                </button>
              </form>

              <hr className="my-4 text-muted" />

              <div className="text-center">
                <p className="mb-0 text-muted small">Már van fiókod?</p>
                <Link to="/login" className="fw-bold text-decoration-none">Jelentkezz be itt</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;