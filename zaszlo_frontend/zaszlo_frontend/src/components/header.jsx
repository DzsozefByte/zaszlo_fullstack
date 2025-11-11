import bootstrap from 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React from 'react';
import ReactCountryFlag from "react-country-flag";



const Header = () => {
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">Lobogó</a>
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
              <a className="nav-link active" aria-current="page" href="#">Kezdőlap</a>
            </li>
            {/* Dropdown 1 */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Kontinens
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#"><ReactCountryFlag countryCode="EU" svg /> Európa</a></li>
                <li><a className="dropdown-item" href="#"><ReactCountryFlag countryCode="US" svg /> Amerika</a></li>
                <li><a className="dropdown-item" href="#"><ReactCountryFlag countryCode="CN" svg /> Ázsia</a></li>
                <li><a className="dropdown-item" href="#"><ReactCountryFlag countryCode="ZA" svg /> Afrika</a></li>
                <li><a className="dropdown-item" href="#"><ReactCountryFlag countryCode="AU" svg /> Óceánia</a></li>                                
              </ul>
            </li>
            {/* Dropdown 2 */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Méret
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">60x40 cm</a></li>
                <li><a className="dropdown-item" href="#">90x60 cm</a></li>
                <li><a className="dropdown-item" href="#">150x90 cm</a></li>
                <li><a className="dropdown-item" href="#">200x100 cm</a></li>                
                <li><a className="dropdown-item" href="#">300x150 cm</a></li>
              </ul>
            </li>
            {/* Dropdown 3 */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Anyag
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">Poliészter</a></li>
                <li><a className="dropdown-item" href="#">Selyem</a></li>
                <li><a className="dropdown-item" href="#">Nylon</a></li>
                <li><a className="dropdown-item" href="#">rPET</a></li>                
              </ul>
            </li>
          </ul>
          <form className="d-flex" role="search">
            <input
              className="form-control me-2"
              type="search"
              placeholder="Keresés..."
              aria-label="Search"
            />
            <button className="btn btn-outline-success" type="submit">Keres</button>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Header;