import './App.css';
import React from 'react';
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
import Kosar from './components/Kosar.jsx'; // ÚJ IMPORT
import { KosarProvider } from './context/KosarContext.jsx'; // ÚJ IMPORT

function App() {
  return (
    <KosarProvider> {/* Itt kezdődik a provider */}
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Fooldal />} />
          <Route path="/kereso" element={<Kereso />} />
          <Route path="/termek/:country" element={<Termek />} />
          <Route path="/kosar" element={<Kosar />} /> {/* ÚJ ROUTE */}
          <Route path="/kapcsolat" element={<Kapcsolat />} />
          <Route path="/aszf" element={<Aszf />} />
          <Route path="/rolunk" element={<Rolunk />} />
        </Routes>
        <Footer />
      </Router>
    </KosarProvider> /* Itt záródik */
  );
}

export default App;