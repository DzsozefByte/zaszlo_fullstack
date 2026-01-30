import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter, FaFlag } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row g-4">
          
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center mb-3">
                <FaFlag className="text-primary me-2" size={24}/>
                <h4 className="m-0 fw-bold">Zászlómánia</h4>
            </div>
            <p className="text-secondary small">
              Magyarország legnagyobb zászló webshopja. Prémium minőség, egyedi méretek és villámgyors szállítás közvetlenül a raktárról.
            </p>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-bold mb-3 text-uppercase small ls-1">Vásárlás</h6>
            <ul className="list-unstyled text-secondary small">
              <li className="mb-2"><Link to="/kereso" className="text-decoration-none text-secondary hover-white">Termékek</Link></li>
              <li className="mb-2"><Link to="/akciok" className="text-decoration-none text-secondary hover-white">Akciók</Link></li>
              <li className="mb-2"><Link to="/ujdonsagok" className="text-decoration-none text-secondary hover-white">Újdonságok</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-bold mb-3 text-uppercase small ls-1">Információk</h6>
            <ul className="list-unstyled text-secondary small">
              <li className="mb-2"><Link to="/rolunk" className="text-decoration-none text-secondary hover-white">Rólunk</Link></li>
              <li className="mb-2"><Link to="/kapcsolat" className="text-decoration-none text-secondary hover-white">Kapcsolat</Link></li>
              <li className="mb-2"><Link to="/aszf" className="text-decoration-none text-secondary hover-white">ÁSZF</Link></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-12">
             <h6 className="text-white fw-bold mb-3 text-uppercase small ls-1">Elérhetőség</h6>
             <p className="text-secondary small mb-1">info@zaszlomania.hu</p>
             <p className="text-secondary small">+36 1 234 5678</p>
             <div className="d-flex gap-3 mt-3">
                <a href="#" className="text-light social-icon"><FaFacebook size={20}/></a>
                <a href="#" className="text-light social-icon"><FaInstagram size={20}/></a>
                <a href="#" className="text-light social-icon"><FaTwitter size={20}/></a>
             </div>
          </div>
        </div>

        <hr className="border-secondary my-4 opacity-25" />
        
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-secondary">
            <div>© {new Date().getFullYear()} Zászlómánia Kft. Minden jog fenntartva.</div>
            <div className="mt-2 mt-md-0">
                Created with <i className="bi bi-heart-fill text-danger mx-1"></i> in Hungary.
            </div>
        </div>
      </div>
      <style>{`
        .ls-1 { letter-spacing: 1px; }
        .hover-white:hover { color: #fff !important; transition: 0.2s; }
        .social-icon:hover { color: #0d6efd !important; transform: translateY(-3px); transition: 0.3s; }
      `}</style>
    </footer>
  );
};

export default Footer;