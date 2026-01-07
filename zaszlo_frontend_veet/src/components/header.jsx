import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React, { useState, useEffect, useContext } from 'react';
import ReactCountryFlag from "react-country-flag";
import { IoMdCart, IoMdClose, IoMdPerson } from "react-icons/io";
import { Link, useNavigate } from 'react-router-dom';
import httpCommon from "../http-common";
import { KosarContext } from "../context/KosarContext";

const Header = () => {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const { kosar, vegosszeg, isMiniCartOpen, setIsMiniCartOpen, torlesKosarbol } = useContext(KosarContext);

  const osszesDb = kosar.reduce((acc, item) => acc + item.db, 0);

  useEffect(() => {
    const load = async () => {
      if (searchText.length < 2) {
        setResults([]);
        return;
      }

      try {
        const res = await httpCommon.get(`/zaszlok/search?orszag=${searchText}`);
        const list = Array.isArray(res.data) ? res.data : [res.data];
        const unique = Array.from(new Map(list.map(z => [z.orszag, z])).values());
        setResults(unique);
      } catch {
        setResults([]);
      }
    };

    const timer = setTimeout(() => load(), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const goTo = (country) => {
    setSearchText("");
    setResults([]);
    navigate(`/termek/${encodeURIComponent(country)}`);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm sticky-top">
      <div className="container-fluid">

        {/* LOGÓ + NÉV */}
        <Link className="navbar-brand d-flex align-items-center" to="/" style={{ gap: "10px" }}>
          <img
            src="/images/logo.png"
            alt="Zászlómánia logó"
            style={{ height: "55px", width: "auto" }}
          />
          <span className="fw-bold" style={{ fontSize: "1.5rem", letterSpacing: "1px" }}>
            Zászlómánia
          </span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active fw-medium" aria-current="page" to="/">Kezdőlap</Link>
            </li>
            <Link className="nav-link fw-medium" aria-current="page" to="/kereso">Szűrő</Link>
            <Link className="nav-link fw-medium" aria-current="page" to="/rolunk">Rólunk</Link>

            {/* Kontinens dropdown */}
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle fw-medium" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Kontinens
              </a>
              <ul className="dropdown-menu shadow-sm">
                <li><Link className="dropdown-item" to="/kereso?continent=Európa"><ReactCountryFlag countryCode="EU" svg /> Európa</Link></li>
                <li><Link className="dropdown-item" to="/kereso?continent=Amerika"><ReactCountryFlag countryCode="US" svg /> Amerika</Link></li>
                <li><Link className="dropdown-item" to="/kereso?continent=Ázsia"><ReactCountryFlag countryCode="CN" svg /> Ázsia</Link></li>
                <li><Link className="dropdown-item" to="/kereso?continent=Afrika"><ReactCountryFlag countryCode="ZA" svg /> Afrika</Link></li>
                <li><Link className="dropdown-item" to="/kereso?continent=Óceánia"><ReactCountryFlag countryCode="AU" svg /> Óceánia</Link></li>
              </ul>
            </li>
          </ul>

          {/* JOBB OLDALI IKONOK KONTÉNER */}
          <div className="d-flex align-items-center">

            {/* --- USER / BEJELENTKEZÉS DROPDOWN --- */}
            <div className="nav-item dropdown me-3">
              <a 
                className="nav-link d-flex align-items-center text-dark" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <IoMdPerson size={28} />
              </a>
              <ul className="dropdown-menu dropdown-menu-end shadow-sm" style={{ minWidth: "200px" }}>
                 {/* Később ide jöhet feltétel: ha be van lépve, akkor "Profil", "Kilépés" */}
                <li><h6 className="dropdown-header">Fiók</h6></li>
                <li><Link className="dropdown-item" to="/login">Bejelentkezés</Link></li>
                <li><Link className="dropdown-item" to="/register">Regisztráció</Link></li>
              </ul>
            </div>

            {/* --- MINI KOSÁR --- */}
            <div className="me-3 position-relative">
              <div 
                style={{ cursor: 'pointer' }} 
                onClick={() => setIsMiniCartOpen(!isMiniCartOpen)}
              >
                <IoMdCart size={28} />
                {osszesDb > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {osszesDb}
                  </span>
                )}
              </div>

              {isMiniCartOpen && (
                <div 
                  className="card shadow position-absolute end-0 mt-3 bg-white" 
                  style={{ width: "320px", zIndex: 1050, border: "1px solid rgba(0,0,0,0.1)" }}
                >
                  <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom">
                    <h6 className="m-0 fw-bold">Kosár ({osszesDb})</h6>
                    <button className="btn btn-sm btn-light rounded-circle" onClick={() => setIsMiniCartOpen(false)}>
                      <IoMdClose size={16}/>
                    </button>
                  </div>
                  <div className="card-body p-0" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {kosar.length === 0 ? (
                      <div className="text-center p-4 text-muted">
                        <p className="mb-0">A kosarad jelenleg üres.</p>
                      </div>
                    ) : (
                      <ul className="list-group list-group-flush">
                        {kosar.map((item) => (
                          <li key={`${item.id}-${item.meret}-${item.anyag}`} className="list-group-item d-flex gap-2 align-items-center">
                            <img 
                              src={item.kep} 
                              alt={item.orszag} 
                              style={{ width: "40px", height: "auto", borderRadius: "4px" }} 
                            />
                            <div className="flex-grow-1" style={{ lineHeight: "1.2" }}>
                              <div className="fw-bold small">{item.orszag} zászló</div>
                              <small className="text-muted d-block" style={{fontSize: "0.8rem"}}>
                                {item.meret}, {item.anyag}
                              </small>
                              <div className="small fw-semibold text-primary">
                                {item.db} db x {item.ar.toLocaleString()} Ft
                              </div>
                            </div>
                            <button 
                              className="btn btn-link text-danger p-0" 
                              title="Törlés"
                              onClick={(e) => {
                                e.stopPropagation();
                                torlesKosarbol(item.id, item.meret, item.anyag);
                              }}
                            >
                              <IoMdClose size={18} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {kosar.length > 0 && (
                    <div className="card-footer bg-light p-3">
                      <div className="d-flex justify-content-between fw-bold mb-3">
                        <span>Összesen:</span>
                        <span>{vegosszeg.toLocaleString()} Ft</span>
                      </div>
                      <button 
                        className="btn btn-primary w-100" 
                        onClick={() => {
                          setIsMiniCartOpen(false);
                          navigate("/kosar");
                        }}
                      >
                        Kosár megtekintése
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Keresőmező (Autocomplete) */}
            <div className="position-relative d-none d-lg-block" style={{ width: "250px" }}>
              <input
                className="form-control rounded-pill"
                type="search"
                placeholder="Keresés..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {results.length > 0 && (
                <ul
                  className="list-group position-absolute w-100 mt-1 shadow-sm"
                  style={{ borderRadius: "10px", zIndex: 9999 }}
                >
                  {results.map((item) => (
                    <li
                      key={item.id}
                      className="list-group-item list-group-item-action"
                      style={{ cursor: "pointer" }}
                      onClick={() => goTo(item.orszag)}
                    >
                      {item.orszag}
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div> {/* End of Right Side Icons Container */}

        </div>
      </div>
      <style>{`
        .navbar-nav .nav-link:hover, .dropdown-item:hover {
          color: #0d6efd;
        }
        .dropdown-menu {
          border-radius: 0.5rem;
        }
        .card-body::-webkit-scrollbar {
            width: 6px;
        }
        .card-body::-webkit-scrollbar-thumb {
            background-color: #ccc;
            border-radius: 4px;
        }
      `}</style>
    </nav>
  );
};

export default Header;