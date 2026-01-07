import './App.css';
import {useState, useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header.jsx';
import Fooldal from './components/fooldal.jsx';
import Kereso from './components/kereso.jsx';
import Termek from './components/termek.jsx';
import Footer from './components/footer.jsx';
import Kapcsolat from './components/kapcsolat.jsx';
import Aszf from './components/aszf.jsx';
import Rolunk from './components/rolunk.jsx';
import Kosar from './components/Kosar.jsx';
import Login from './components/Login.jsx'; // ÚJ
import Register from './components/Register.jsx'; // ÚJ
import { KosarProvider } from './context/KosarContext.jsx';
import httpCommon from './http-common.js';

function App() {

  const  [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const refreshToken = async () => {
      try {
        const res = await httpCommon.post("/auth/refresh-token",{}, {
          withCredentials: true,
        });
        setAccessToken(res.data.accessToken);
      } 
      catch(err){
        throw err;
      }
    };
  }, []);
  return (
    <KosarProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Fooldal />} />
          <Route path="/kereso" element={<Kereso />} />
          <Route path="/termek/:country" element={<Termek />} />
          <Route path="/kosar" element={<Kosar />} />
          <Route path="/kapcsolat" element={<Kapcsolat />} />
          <Route path="/aszf" element={<Aszf />} />
          <Route path="/rolunk" element={<Rolunk />} />
          
          {/* ÚJ ROUTE-OK */}
          <Route path="/login" element={<Login setAccesstoken={setAccessToken}  accessToken={accessToken} />} />
          <Route path="/register" element={<Register />} />
          
        </Routes>
        <Footer />
      </Router>
    </KosarProvider>
  );
}

export default App;