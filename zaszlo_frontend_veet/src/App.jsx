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
import Kosar from './components/kosar.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Profil from './components/Profil.jsx';
import AdminPanel from './components/AdminPanel.jsx';

import Fizetes from './components/Fizetes.jsx'; 

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
        const newToken = res.data.accessToken;
        setAccessToken(newToken);
        
        // FONTOS: Frissítésnél is mentsük el, hogy a Fizetes.jsx lássa!
        localStorage.setItem('token', newToken); 
      }
      catch (err) {
        setAccessToken("");
        setUser(null);
        localStorage.removeItem('token'); // Ha sikertelen, takarítsunk ki
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

  const logout = async () => {
    try {
      // Megpróbáljuk a backendről is törölni a sütit
      await httpCommon.post("/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Hiba a kijelentkezés során:", error);
    } finally {
      // FONTOS: Mindent ki kell takarítani!
      setAccessToken("");
      setUser(null);
      localStorage.removeItem('token'); // EZ HIÁNYZOTT!
      console.log("Kijelentkezés: token törölve a localStorage-ból.");
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
          
          {/* FONTOS: A Fizetes-nek is átadhatjuk az accessToken-t propként a biztonság kedvéért */}
          <Route path="/fizetes" element={<Fizetes accessToken={accessToken} />} />

          <Route path="/kapcsolat" element={<Kapcsolat />} />
          <Route path="/aszf" element={<Aszf />} />
          <Route path="/rolunk" element={<Rolunk />} />

          <Route path="/login" element={<Login setAccesstoken={setAccessToken} />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/profil" element={<Profil accessToken={accessToken} />} />
          <Route 
              path="/admin" 
              element={
                user && user.szerep === 'admin' ? (
                  <AdminPanel accessToken={accessToken} />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
        </Routes>
        <Footer />
      </Router>
    </KosarProvider>
  );
}

export default App;