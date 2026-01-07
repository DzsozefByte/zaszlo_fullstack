import { useState } from 'react';
import { Link } from 'react-router-dom';
import httpCommon from '../http-common.js';

const Register = () => {
  const [formData, setFormData] = useState({
    nev: '',
    email: '',
    jelszo: '',
    confirmJelszo: ''
  });
const [error, setError] = useState("")
  const handleChange = (e) => {
    setFormData({...formData, [e.target.id]: e.target.value});
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.nev || !formData.email || !formData.jelszo) {
  setError("Kérlek tölts ki minden mezőt!");
  return;
}

  try {
    await httpCommon.post(
      "/auth/register",
      { nev: formData.nev, email: formData.email, jelszo: formData.jelszo },
      { withCredentials: true } 
    );
    alert("Sikeres regisztráció!");

  } catch (err) {
    console.error(err.response?.data || err.message);
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
              
              <form onSubmit={handleSubmit}>
                {/* Név */}
                <div className="mb-3">
                  <label htmlFor="nev" className="form-label fw-medium">Teljes név</label>
                  <input 
                    type="text" 
                    className="form-control form-control-lg" 
                    id="nev" 
                    placeholder="Kovács János"
                    value={formData.nev}
                    onChange={handleChange}
                    required 
                  />
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-medium">Email cím</label>
                  <input 
                    type="email" 
                    className="form-control form-control-lg" 
                    id="email" 
                    placeholder="pelda@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>

                {/* Jelszó */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="password" className="form-label fw-medium">Jelszó</label>
                    <input 
                      type="password" 
                      className="form-control form-control-lg" 
                      id="jelszo" 
                      placeholder="********"
                      value={formData.jelszo}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="confirmJelszo" className="form-label fw-medium">Jelszó megerősítése</label>
                    <input 
                      type="password" 
                      className="form-control form-control-lg" 
                      id="confirmJelszo" 
                      placeholder="********"
                      value={formData.confirmJelszo}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>

                {/* ÁSZF checkbox */}
                <div className="form-check mb-4">
                  <input className="form-check-input" type="checkbox" id="terms" required />
                  <label className="form-check-label small text-muted" htmlFor="terms">
                    Elfogadom az <Link to="/aszf" className="text-decoration-none">Általános Szerződési Feltételeket</Link> és az Adatkezelési Tájékoztatót.
                  </label>
                </div>

                {/* Gomb */}
                <button type="submit" className="btn btn-primary w-100 btn-lg rounded-pill fw-bold">
                  Regisztráció
                </button>
              </form>

              <hr className="my-4 text-muted" />

              <div className="text-center">
                <p className="mb-0 text-muted">Már van fiókod?</p>
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