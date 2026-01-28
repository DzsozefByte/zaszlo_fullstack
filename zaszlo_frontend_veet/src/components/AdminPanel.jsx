import React, { useState, useEffect } from 'react'; // Fontos: React importálva!
import httpCommon from '../http-common.js';

const AdminPanel = ({ accessToken }) => {
  const [csoportositott, setCsoportositott] = useState({});
  const [nyitottOrszagok, setNyitottOrszagok] = useState({});
  const [uzenet, setUzenet] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const MERET_OPCIOK = [
    { id: 1, nev: "60x40cm" },
    { id: 2, nev: "90x60cm" },
    { id: 3, nev: "150x90cm" },
    { id: 4, nev: "200x100cm" },
    { id: 5, nev: "300x150cm" }
  ];

  const ANYAG_OPCIOK = [
    { id: 1, nev: "poliészter" },
    { id: 2, nev: "selyem" },
    { id: 3, nev: "nylon" },
    { id: 4, nev: "rPET" }
  ];

  const [formData, setFormData] = useState({
    orszag: "",
    kontinens: "Európa",
    meretId: 1,
    anyagId: 1,
    ar: ""
  });

  const fetchZaszlok = async () => {
    try {
      const res = await httpCommon.get("/zaszlok/admin-list", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log("Backend adatok:", res.data); // Ellenőrzés a konzolban
      csoportositas(res.data);
    } catch (err) {
      console.error("Hiba az adatok lekérésekor", err);
    }
  };

  const csoportositas = (adatok) => {
    const map = {};
    adatok.forEach((item) => {
      const orszagNev = item.orszag;
      if (!map[orszagNev]) {
        map[orszagNev] = {
          nev: orszagNev,
          kontinens: item.kontinens,
          orszagId: item.orszagId, // Ellenőrizd, hogy ez nem undefined!
          variaciok: []
        };
      }
      map[orszagNev].variaciok.push(item);
    });
    setCsoportositott(map);
  };

  useEffect(() => {
    fetchZaszlok();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setUzenet("Feldolgozás...");
    try {
      const res = await httpCommon.post("/zaszlok", formData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (selectedFile && res.data.orszagId) {
        const imageData = new FormData();
        imageData.append('image', selectedFile);

        await httpCommon.post(`/zaszlok/upload/${res.data.orszagId}`, imageData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}` 
          }
        });
      }

      setUzenet("Sikeres hozzáadás!");
      setFormData({ orszag: "", kontinens: "Európa", meretId: 1, anyagId: 1, ar: "" });
      setSelectedFile(null);
      document.getElementById('fileInput').value = "";
      fetchZaszlok();
    } catch (err) {
      setUzenet("Hiba történt a mentés során.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Biztosan törölni szeretnéd?")) {
      try {
        await httpCommon.delete(`/zaszlok/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        fetchZaszlok();
      } catch (err) {
        setUzenet("Hiba a törlés során.");
      }
    }
  };

  const toggleRow = (orszagNev) => {
    setNyitottOrszagok(prev => ({ ...prev, [orszagNev]: !prev[orszagNev] }));
  };

  return (
    <div className="container mt-5 pb-5">
      <h2 className="mb-4">🛡️ Adminisztrációs Felület</h2>

      <div className="card shadow-sm mb-4 border-0">
        <div className="card-header bg-primary text-white fw-bold">Új zászló hozzáadása</div>
        <div className="card-body bg-light">
          <form onSubmit={handleCreate} className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-bold">Ország neve</label>
              <input type="text" className="form-control" value={formData.orszag} required
                onChange={(e) => setFormData({...formData, orszag: e.target.value})} />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold">Kontinens</label>
              <select className="form-select" value={formData.kontinens}
                onChange={(e) => setFormData({...formData, kontinens: e.target.value})}>
                <option value="Európa">Európa</option>
                <option value="Ázsia">Ázsia</option>
                <option value="Afrika">Afrika</option>
                <option value="Észak-Amerika">Észak-Amerika</option>
                <option value="Dél-Amerika">Dél-Amerika</option>
                <option value="Óceánia">Óceánia</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold">Méret</label>
              <select className="form-select" value={formData.meretId}
                onChange={(e) => setFormData({...formData, meretId: Number(e.target.value)})}>
                {MERET_OPCIOK.map(m => <option key={m.id} value={m.id}>{m.nev}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold">Anyag</label>
              <select className="form-select" value={formData.anyagId}
                onChange={(e) => setFormData({...formData, anyagId: Number(e.target.value)})}>
                {ANYAG_OPCIOK.map(a => <option key={a.id} value={a.id}>{a.nev}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-bold">Kép (.png)</label>
              <input type="file" id="fileInput" className="form-control" accept="image/png"
                onChange={(e) => setSelectedFile(e.target.files[0])} />
            </div>
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-success px-4">Hozzáadás</button>
            </div>
          </form>
        </div>
      </div>

      {uzenet && <div className="alert alert-info">{uzenet}</div>}

      <div className="table-responsive shadow-sm">
        <table className="table table-hover align-middle mb-0 bg-white">
          <thead className="table-dark">
            <tr>
              <th style={{width: '50px'}}></th>
              <th>Kép</th>
              <th>Ország</th>
              <th>Kontinens</th>
              <th className="text-center">Variációk</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(csoportositott).map((csoport) => (
              <React.Fragment key={csoport.nev}>
                <tr onClick={() => toggleRow(csoport.nev)} style={{cursor: 'pointer'}}>
                  <td className="text-center">{nyitottOrszagok[csoport.nev] ? "▼" : "►"}</td>
                  <td>
                    <img 
                      src={`/images/${csoport.orszagId}.png`} 
                      alt="" 
                      style={{ width: "45px", height: "30px", objectFit: "cover", border: "1px solid #ccc" }}
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://via.placeholder.com/45x30?text=?';
                      }}
                    />
                  </td>
                  <td className="fw-bold">{csoport.nev}</td>
                  <td>{csoport.kontinens}</td>
                  <td className="text-center"><span className="badge bg-secondary">{csoport.variaciok.length} db</span></td>
                </tr>
                {nyitottOrszagok[csoport.nev] && (
                  <tr>
                    <td colSpan="5" className="p-0">
                      <div className="p-3 bg-light">
                        <table className="table table-sm table-bordered bg-white mb-0">
                          <thead>
                            <tr className="table-secondary">
                              <th>ID</th><th>Méret</th><th>Anyag</th><th className="text-center">Művelet</th>
                            </tr>
                          </thead>
                          <tbody>
                            {csoport.variaciok.map(v => (
                              <tr key={v.id}>
                                <td>{v.id}</td><td>{v.meret_nev}</td><td>{v.anyag_nev}</td>
                                <td className="text-center">
                                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(v.id)}>Törlés</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;