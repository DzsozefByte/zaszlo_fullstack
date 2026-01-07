import { useState } from 'react';
import { Link } from 'react-router-dom';
import httpCommon from '../http-common.js';

const Login = ({ setAccesstoken }) => {
  const [email, setEmail] = useState('');
  const [jelszo, setJelszo] = useState('');
  const [error, setError] = useState("")

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await httpCommon.post(
      "/auth/login",
      { email, jelszo },
      { withCredentials: true } 
    )
    setAccesstoken(res.data.accessToken);
    

  } catch (err) {
    console.error(err.response?.data || err.message);
    setError(err.response?.data?.message || "Hiba a bejelentkezéskor");
  }
};


  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5">
              <h3 className="text-center fw-bold mb-4">Bejelentkezés</h3>
              
              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-medium">Email cím</label>
                  <input 
                    type="email" 
                    className="form-control form-control-lg" 
                    id="email" 
                    placeholder="pelda@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>

                {/* Jelszó */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-medium">Jelszó</label>
                  <input 
                    type="password" 
                    className="form-control form-control-lg" 
                    id="password" 
                    placeholder="********"
                    value={jelszo}
                    onChange={(e) => setJelszo(e.target.value)}
                    required 
                  />
                </div>

                {/* Emlékezz rám + Elfelejtett jelszó */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="rememberMe" />
                    <label className="form-check-label small" htmlFor="rememberMe">
                      Emlékezz rám
                    </label>
                  </div>
                  <a href="#" className="text-decoration-none small text-muted">Elfelejtett jelszó?</a>
                </div>

                {/* Gomb */}
                <button type="submit" className="btn btn-primary w-100 btn-lg rounded-pill fw-bold">
                  Belépés
                </button>
              </form>

              <hr className="my-4 text-muted" />

              <div className="text-center">
                <p className="mb-0 text-muted">Nincs még fiókod?</p>
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