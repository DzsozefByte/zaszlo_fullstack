import './App.css';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header.jsx';
import Fooldal from './components/fooldal.jsx';
import Kereso from './components/kereso.jsx';
import Termek from './components/termek.jsx';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Fooldal />} />
        <Route path="/kereso" element={<Kereso />} />
        <Route path="/termek/:country" element={<Termek />} />
      </Routes>
    </Router>
  );
}

export default App;
