import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaXTwitter, FaFlag } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="footer-bg text-light mt-5 pt-4 pb-3">
      <div className="container">

        <div className="row">

          {/* --- Logo + leírás --- */}
          <div className="col-md-4 mb-4">
            <h4 className="fw-bold d-flex align-items-center">
              <FaFlag className="me-2 text-primary" /> Zászlómánia
            </h4>
            <p className="text-white-50">
              Prémium minőségű országzászlók különböző méretekben és anyagokban.  
              Válassz a világ minden tájáról!
            </p>
          </div>

          {/* --- Linkek --- */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold mb-3">Oldalak</h5>
            <ul className="list-unstyled">
              <li><Link className="footer-link" to="/">Kezdőlap</Link></li>
              <li><Link className="footer-link" to="/kereso">Szűrő</Link></li>
              <li><Link className="footer-link" to="/kapcsolat">Kapcsolat</Link></li>
              <li><Link className="footer-link" to="/aszf">ÁSZF</Link></li>
            </ul>
          </div>

          {/* --- Social + Extra info --- */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold mb-3">Kapcsolat</h5>
            <p className="text-white-50 mb-1">Email: info@zaszlomania.hu</p>
            <p className="text-white-50">Telefon: +36 30 123 4567</p>

            <div className="mt-3 d-flex gap-3">
              <a href="https://www.facebook.com/Flagonlinestore/?locale=hu_HU" className="social-icon"><FaFacebook size={22} /></a>
              <a href="https://www.instagram.com/newflagshop/" className="social-icon"><FaInstagram size={22} /></a>
              <a href="https://x.com/TheFlagShop" className="social-icon"><FaXTwitter size={22} /></a>
            </div>
          </div>

        </div>

        <hr className="border-secondary" />

        <div className="text-center text-white-50">
          © {new Date().getFullYear()} Zászlómánia – Minden jog fenntartva.
        </div>
      </div>

      {/* Inline CSS */}
      <style>{`
        .footer-bg {
          background: #1c1f24;
        }
        .footer-link {
          color: #ccc;
          text-decoration: none;
          transition: 0.2s;
        }
        .footer-link:hover {
          color: #0d6efd;
          padding-left: 4px;
        }
        .social-icon {
          color: #ccc;
          transition: 0.2s;
        }
        .social-icon:hover {
          color: #0d6efd;
          transform: translateY(-3px);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
