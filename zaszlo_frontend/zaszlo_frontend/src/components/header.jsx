import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React, { useState, useEffect } from 'react';
import ReactCountryFlag from "react-country-flag";
import { IoMdCart } from "react-icons/io";
import { Link, useNavigate } from 'react-router-dom';
import httpCommon from "../http-common";

const Header = () => {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  // Autocomplete keresés
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

  // Eredményre kattintás → átirányítás
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

            {/* Kontinens dropdown */}
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle fw-medium" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Kontinens
              </a>
              <ul className="dropdown-menu shadow-sm">
                <li>
                  <Link className="dropdown-item" to="/kereso?continent=Európa">
                    <ReactCountryFlag countryCode="EU" svg /> Európa
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/kereso?continent=Amerika">
                    <ReactCountryFlag countryCode="US" svg /> Amerika
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/kereso?continent=Ázsia">
                    <ReactCountryFlag countryCode="CN" svg /> Ázsia
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/kereso?continent=Afrika">
                    <ReactCountryFlag countryCode="ZA" svg /> Afrika
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/kereso?continent=Óceánia">
                    <ReactCountryFlag countryCode="AU" svg /> Óceánia
                  </Link>
                </li>
              </ul>
            </li>
          </ul>

          {/* Kosár ikon */}
          <div className="me-3 position-relative">
            <IoMdCart size={28} style={{ cursor: 'pointer' }} />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              0
            </span>
          </div>

          {/* --- Autocomplete Search --- */}
          <div className="position-relative" style={{ width: "250px" }}>
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

        </div>
      </div>

      <style>{`
        .navbar-nav .nav-link:hover, .dropdown-item:hover {
          color: #0d6efd;
        }
        .dropdown-menu {
          border-radius: 0.5rem;
        }
      `}</style>
    </nav>
  );
};

export default Header;
