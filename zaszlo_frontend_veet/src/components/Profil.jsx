import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import httpCommon from '../http-common';
import { IoMdPerson } from "react-icons/io";

const Profil = ({ accessToken }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Ha nincs token, dobjuk vissza a főoldalra vagy loginra
    if (!accessToken) {
        // Várunk kicsit, hátha csak a refresh fut, de ha tartósan nincs, akkor redirect
        // Itt most egyszerűsítve: ha a parent komponens (App) null-t ad, akkor nem fut le a fetch
        return; 
    }

    const fetchProfil = async () => {
      try {
        const response = await httpCommon.get("/auth/profil", {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        setUserData(response.data.user);
      } catch (error) {
        console.error("Hiba a profil lekérésekor:", error);
        // Ha lejárt a token vagy hiba van, navigáljunk a loginra
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfil();
  }, [accessToken, navigate]);

  if (!accessToken) {
      return (
          <div className="container mt-5 text-center">
              <p>Jelentkezz be a profilod megtekintéséhez!</p>
              <button className="btn btn-primary" onClick={() => navigate("/login")}>Bejelentkezés</button>
          </div>
      );
  }

  if (loading) {
    return <div className="container mt-5 text-center"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white text-center py-4">
               <IoMdPerson size={64} className="mb-2" />
               <h3 className="mb-0">Fiókom</h3>
            </div>
            <div className="card-body p-4">
              {userData ? (
                <div className="d-flex flex-column gap-3">
                  <div className="border-bottom pb-2">
                    <small className="text-muted text-uppercase">Név</small>
                    <div className="fs-5 fw-medium">{userData.nev}</div>
                  </div>

                  <div className="border-bottom pb-2">
                    <small className="text-muted text-uppercase">Email cím</small>
                    <div className="fs-5 fw-medium">{userData.email}</div>
                  </div>

                  <div className="border-bottom pb-2">
                    <small className="text-muted text-uppercase">Jogosultság</small>
                    <div>
                        <span className="badge bg-secondary fs-6">{userData.jogosultsag}</span>
                    </div>
                  </div>
                  
                  {/* Itt lehetne később: Cím szerkesztése, Korábbi rendelések, stb. */}
                  
                </div>
              ) : (
                <div className="alert alert-danger">Nem sikerült betölteni az adatokat.</div>
              )}
            </div>
            <div className="card-footer bg-white text-end p-3">
                <button className="btn btn-outline-secondary" onClick={() => navigate("/")}>Vissza a főoldalra</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;