import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import httpCommon from '../http-common.js';
import { Alert } from 'react-bootstrap';

const Login = ({ setAccesstoken }) => {
  const [email, setEmail] = useState('');
  const [jelszo, setJelszo] = useState('');
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await httpCommon.post(
        "/auth/login",
        { email, jelszo },
        { withCredentials: true }
      );

      localStorage.setItem('token', res.data.accessToken);
      setAccesstoken(res.data.accessToken);
      navigate("/"); // Sikeres belépés után főoldal
    } catch (err) {
      setError(err.response?.data?.message || "Helytelen email vagy jelszó!");
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5">
              <h3 className="text-center fw-bold mb-4">Bejelentkezés</h3>
              
              {error && <Alert variant="danger" className="py-2 small text-center">{error}</Alert>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-medium small">Email cím</label>
                  <input 
                    type="email" 
                    className="form-control form-control-lg bg-light border-0" 
                    placeholder="pelda@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium small">Jelszó</label>
                  <input 
                    type="password" 
                    className="form-control form-control-lg bg-light border-0" 
                    placeholder="********"
                    value={jelszo}
                    onChange={(e) => setJelszo(e.target.value)}
                    required 
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="rememberMe" />
                    <label className="form-check-label small" htmlFor="rememberMe">Emlékezz rám</label>
                  </div>
                  <a href="#" className="text-decoration-none small text-muted">Elfelejtett jelszó?</a>
                </div>

                <button type="submit" className="btn btn-primary w-100 btn-lg rounded-pill fw-bold shadow-sm">
                  Belépés
                </button>
              </form>

              <hr className="my-4 text-muted" />

              <div className="text-center">
                <p className="mb-0 text-muted small">Nincs még fiókod?</p>
                <Link to="/register" className="fw-bold text-decoration-none">Regisztráció létrehozása</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;