import './App.css';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; 

import Header from './components/header.jsx';
import Fooldal from './components/fooldal.jsx';
import Kereso from './components/kereso.jsx';
import Termek from './components/termek.jsx';
import Footer from './components/footer.jsx';
import Kapcsolat from './components/kapcsolat.jsx';
import Aszf from './components/aszf.jsx';
import Rolunk from './components/rolunk.jsx';
import Kosar from './components/Kosar.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Profil from './components/Profil.jsx'; // ÚJ IMPORT
import { KosarProvider } from './context/KosarContext.jsx';
import httpCommon from './http-common.js';

function App() {
  const [accessToken, setAccessToken] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const refreshToken = async () => {
      try {
        const res = await httpCommon.post("/auth/refresh-token", {}, {
          withCredentials: true,
        });
        setAccessToken(res.data.accessToken);
      }
      catch (err) {
        setAccessToken("");
        setUser(null);
      }
    };
    refreshToken();
  }, []);

  useEffect(() => {
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken);
        setUser(decoded);
      } catch (error) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [accessToken]);

  // MÓDOSÍTOTT LOGOUT FÜGGVÉNY
  const logout = async () => {
    try {
      // 1. Backend hívás a cookie törléséhez
      await httpCommon.post("/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Hiba a kijelentkezés során (cookie törlés sikertelen):", error);
      // Opcionális: akkor is kiléptetjük a klienst, ha a backend hiba volt
    } finally {
       // 2. Kliens oldali takarítás mindenképp megtörténjen
       setAccessToken("");
       setUser(null);
    }
  };

  return (
    <KosarProvider>
      <Router>
        <Header user={user} logout={logout} />
        
        <Routes>
          <Route path="/" element={<Fooldal />} />
          <Route path="/kereso" element={<Kereso />} />
          <Route path="/termek/:country" element={<Termek />} />
          <Route path="/kosar" element={<Kosar />} />
          <Route path="/kapcsolat" element={<Kapcsolat />} />
          <Route path="/aszf" element={<Aszf />} />
          <Route path="/rolunk" element={<Rolunk />} />

          {/* Login / Register */}
          <Route path="/login" element={<Login setAccesstoken={setAccessToken} accessToken={accessToken} />} />
          <Route path="/register" element={<Register />} />
          
          {/* ÚJ: Profil route */}
          {/* Átadjuk az accessToken-t, hogy le tudja kérni az adatokat */}
          <Route path="/profil" element={<Profil accessToken={accessToken} />} />
          
        </Routes>
        <Footer />
      </Router>
    </KosarProvider>
  );
}

export default App;