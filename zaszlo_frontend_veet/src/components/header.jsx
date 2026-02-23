import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React, { useState, useEffect, useContext } from 'react';
import { Button, Badge } from 'react-bootstrap'; 
import { IoMdCart, IoMdClose, IoMdPerson, IoMdLogOut, IoMdSettings, IoMdSearch } from "react-icons/io";
import { Link, useNavigate } from 'react-router-dom';
import httpCommon from "../http-common";
import { KosarContext } from "../context/KosarContext";

const Header = ({ user, logout }) => {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  // Kiszedjük a setKosar-t is a Context-ből
  const { kosar, vegosszeg, isMiniCartOpen, setIsMiniCartOpen, torlesKosarbol, setKosar } = useContext(KosarContext);
  const osszesDb = kosar.reduce((acc, item) => acc + item.db, 0);

  const kontinensek = [
    { nev: 'Európa', emoji: '🇪🇺' },
    { nev: 'Amerika', emoji: '🌎' },
    { nev: 'Ázsia', emoji: '🌏' },
    { nev: 'Afrika', emoji: '🌍' },
    { nev: 'Óceánia', emoji: '🇦🇺' }
  ];

  useEffect(() => {
    const load = async () => {
      if (searchText.length < 2) { setResults([]); return; }
      try {
        const res = await httpCommon.get(`/zaszlok/search?orszag=${searchText}`);
        const list = Array.isArray(res.data) ? res.data : [res.data];
        const unique = Array.from(new Map(list.map(z => [z.orszag, z])).values());
        setResults(unique);
      } catch { setResults([]); }
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
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top py-2">
      <div className="container">
        
        {/* LOGO */}
        <Link className="navbar-brand d-flex align-items-center me-4" to="/">
          <img src="/images/logo.png" alt="Logo" style={{ height: "45px", width: "auto" }} />
          <span className="fw-bold ms-2 text-dark d-none d-sm-inline" style={{ fontSize: "1.3rem", letterSpacing: "-0.5px" }}>
            Zászlómánia
          </span>
        </Link>

        {/* MOBIL TOGGLER */}
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navContent">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 fw-semibold text-uppercase small">
            <li className="nav-item"><Link className="nav-link px-3" to="/">Kezdőlap</Link></li>
            <li className="nav-item"><Link className="nav-link px-3" to="/kereso">Termékek</Link></li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle px-3" href="#" data-bs-toggle="dropdown">Kontinensek</a>
              <ul className="dropdown-menu shadow border-0 mt-2 fade-in">
                {kontinensek.map(k => (
                    <li key={k.nev}>
                        <Link className="dropdown-item py-2 d-flex align-items-center" to={`/kereso?continent=${k.nev}`}>
                            <span className="me-2 fs-5">{k.emoji}</span> {k.nev}
                        </Link>
                    </li>
                ))}
              </ul>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            
            {/* KERESŐ */}
            <div className="position-relative d-none d-lg-block">
                <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-0 rounded-start-pill ps-3"><IoMdSearch className="text-muted"/></span>
                    <input 
                        className="form-control bg-light border-0 rounded-end-pill py-2" 
                        type="search" 
                        placeholder="Keresés..." 
                        style={{width: '180px'}}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                {results.length > 0 && (
                    <ul className="list-group position-absolute w-100 mt-2 shadow border-0 overflow-hidden" style={{zIndex: 1000, borderRadius: '12px'}}>
                        {results.map(item => (
                            <li key={item.id} className="list-group-item list-group-item-action cursor-pointer small border-0 py-2" onClick={() => goTo(item.orszag)}>
                                {item.orszag}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* FELHASZNÁLÓI PROFIL MENÜ */}
            <div className="dropdown">
                <div className="user-pill d-flex align-items-center p-1 pe-3 border rounded-pill cursor-pointer transition-all shadow-sm bg-white" 
                     data-bs-toggle="dropdown" 
                     role="button">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm me-2" style={{width: '32px', height:'32px'}}>
                        <IoMdPerson size={18}/>
                    </div>
                    <span className="small fw-bold text-dark d-none d-md-block">
                        {user ? user.nev.split(' ')[0] : "Fiók"}
                    </span>
                </div>
                
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-3 p-2 py-3" style={{minWidth: '240px', borderRadius: '16px'}}>
                    {user ? (
                        <>
                            <div className="px-3 pb-2">
                                <p className="mb-0 fw-bold text-dark" style={{fontSize: '0.9rem'}}>{user.nev}</p>
                                <p className="mb-0 text-muted" style={{fontSize: '0.75rem'}}>{user.email}</p>
                            </div>
                            <li><hr className="dropdown-divider mx-2 opacity-50"/></li>
                            <li><Link className="dropdown-item rounded-3 py-2 small" to="/profil"><IoMdSettings size={18} className="me-2 text-muted"/> Fiók beállítások</Link></li>
                            <li><Link className="dropdown-item rounded-3 py-2 small" to="/szamlak"><IoMdSettings size={18} className="me-2 text-muted"/> Számlák</Link></li>
                            {user.szerep === 'admin' && (
                                <li><Link className="dropdown-item rounded-3 py-2 small text-danger" to="/admin"><IoMdSettings size={18} className="me-2"/> Admin panel</Link></li>
                            )}
                            <li>
                                <button className="dropdown-item rounded-3 py-2 small text-danger mt-1" onClick={() => { 
                                    localStorage.removeItem('token'); 
                                    setKosar([]); // <--- KIJELENTKEZÉSKOR ÜRÍTJÜK A KOSARAT
                                    logout(); 
                                    navigate("/"); 
                                }}>
                                    <IoMdLogOut size={18} className="me-2"/> Kijelentkezés
                                </button>
                            </li>
                        </>
                    ) : (
                        <div className="p-2">
                            <p className="small text-muted text-center mb-3">Jelentkezz be a vásárláshoz!</p>
                            <Link className="btn btn-outline-primary w-100 rounded-pill mb-2 btn-sm fw-bold py-2" to="/login">Bejelentkezés</Link>
                            <Link className="btn btn-primary w-100 rounded-pill btn-sm fw-bold text-white py-2" to="/register">Regisztráció</Link>
                        </div>
                    )}
                </ul>
            </div>

            {/* KOSÁR IKON */}
            <div className="position-relative">
                <div className="bg-white border rounded-circle d-flex align-items-center justify-content-center cursor-pointer shadow-sm hover-scale transition-all" 
                     style={{width: '40px', height:'40px'}}
                     onClick={() => setIsMiniCartOpen(!isMiniCartOpen)}>
                    <IoMdCart size={20} className="text-dark"/>
                    {osszesDb > 0 && (
                        <Badge pill bg="primary" className="position-absolute top-0 start-100 translate-middle border border-white shadow-sm" style={{fontSize: '0.7rem'}}>
                            {osszesDb}
                        </Badge>
                    )}
                </div>

                {/* MINI KOSÁR PANEL */}
                {isMiniCartOpen && (
                    <div className="card shadow-lg border-0 position-absolute end-0 mt-3 animate-slide-up" style={{width: '320px', zIndex: 1050, borderRadius: '16px', overflow: 'hidden'}}>
                        <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                            <h6 className="m-0 fw-bold">Kosarad</h6>
                            <IoMdClose className="cursor-pointer text-muted" onClick={() => setIsMiniCartOpen(false)}/>
                        </div>
                        <div className="card-body p-0" style={{maxHeight: '300px', overflowY: 'auto'}}>
                            {kosar.length === 0 ? (
                                <div className="p-5 text-center">
                                    <IoMdCart size={40} className="text-light mb-2"/>
                                    <p className="text-muted small">A kosarad még üres.</p>
                                </div>
                            ) : (
                                <ul className="list-group list-group-flush">
                                    {kosar.map(item => (
                                        <li key={`${item.id}-${item.meret}`} className="list-group-item d-flex gap-3 py-3 align-items-center border-0 border-bottom mx-2">
                                            <img src={item.kep} alt="" style={{width: '50px', height: '35px', objectFit: 'cover', borderRadius: '4px'}}/>
                                            <div className="flex-grow-1 overflow-hidden">
                                                <div className="fw-bold text-truncate small">{item.orszag}</div>
                                                <div className="text-muted" style={{fontSize: '0.7rem'}}>{item.meret} | {item.anyag}</div>
                                                <div className="text-primary fw-bold small mt-1">{item.db} × {item.ar.toLocaleString()} Ft</div>
                                            </div>
                                            <IoMdClose 
                                                className="text-danger cursor-pointer p-1 rounded-circle bg-light" 
                                                size={20}
                                                onClick={(e)=>{e.stopPropagation(); torlesKosarbol(item.id, item.meret, item.anyag)}}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {kosar.length > 0 && (
                            <div className="p-3 bg-light">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="text-muted small fw-bold uppercase">Fizetendő:</span>
                                    <span className="fw-bold text-primary fs-5">{vegosszeg.toLocaleString()} Ft</span>
                                </div>
                                <Button variant="primary" className="w-100 rounded-pill py-2 fw-bold shadow-sm" onClick={()=>{setIsMiniCartOpen(false); navigate("/kosar")}}>
                                    Pénztárhoz
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

          </div>
        </div>
      </div>
      
      {/* EXTRA STÍLUSOK */}
      <style>{`
        .cursor-pointer { cursor: pointer; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .hover-scale:hover { transform: scale(1.1); }
        .user-pill:hover { background-color: #f8f9fa !important; border-color: #0d6efd !important; }
        .nav-link { color: #555 !important; transition: color 0.2s; }
        .nav-link:hover { color: #0d6efd !important; }
        .dropdown-item:active { background-color: #0d6efd; }
        .animate-slide-up {
            animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
};

export default Header;