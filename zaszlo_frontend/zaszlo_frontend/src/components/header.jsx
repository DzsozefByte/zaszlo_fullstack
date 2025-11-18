import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React from 'react';
import ReactCountryFlag from "react-country-flag";
import { IoMdCart } from "react-icons/io";
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/" style={{ fontSize: '1.5rem', letterSpacing: '1px' }}>
          Zászlómánia
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

            {/* Dropdown 1 - Kontinens */}
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

            {/* Dropdown 2 - Méret */}
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle fw-medium" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Méret (cm)
              </a>
              <ul className="dropdown-menu shadow-sm">
                <li><Link className="dropdown-item" to="/kereso?size=60x40">60x40</Link></li>
                <li><Link className="dropdown-item" to="/kereso?size=90x60">90x60</Link></li>
                <li><Link className="dropdown-item" to="/kereso?size=150x90">150x90</Link></li>
                <li><Link className="dropdown-item" to="/kereso?size=200x100">200x100</Link></li>
                <li><Link className="dropdown-item" to="/kereso?size=300x150">300x150</Link></li>
              </ul>
            </li>

            {/* Dropdown 3 - Anyag */}
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle fw-medium" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Anyag
              </a>
              <ul className="dropdown-menu shadow-sm">
                <li><Link className="dropdown-item" to="/kereso?material=Poliészter">Poliészter</Link></li>
                <li><Link className="dropdown-item" to="/kereso?material=Selyem">Selyem</Link></li>
                <li><Link className="dropdown-item" to="/kereso?material=Nylon">Nylon</Link></li>
                <li><Link className="dropdown-item" to="/kereso?material=rPET">rPET</Link></li>
              </ul>
            </li>
          </ul>

          <div className="me-3 position-relative">
            <IoMdCart size={28} style={{ cursor: 'pointer' }} />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              0
            </span>
          </div>

          <form className="d-flex" role="search">
            <input className="form-control me-2 rounded-pill" type="search" placeholder="Keresés..." aria-label="Search" />
            <button className="btn btn-primary rounded-pill" type="submit">Keresés</button>
          </form>
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
