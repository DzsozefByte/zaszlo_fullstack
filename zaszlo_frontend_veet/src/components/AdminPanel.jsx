import { useState, useEffect } from 'react';
import httpCommon from '../http-common.js';

const AdminPanel = ({ accessToken }) => {
  const [zaszlok, setZaszlok] = useState([]);
  const [uzenet, setUzenet] = useState("");
  
  // Új zászló állapota
  const [formData, setFormData] = useState({
    orszag: "",
    kontinens: "Európa",
    meretId: 1, // Alapértelmezett (pl. 90x60)
    anyagId: 1, // Alapértelmezett (pl. Hurkolt poliészter)
    ar: ""
  });

const fetchZaszlok = async () => {
  try {
    // Itt hívjuk meg az új, kifejezetten adminnak készült végpontot
    const res = await httpCommon.get("/zaszlok/admin-list", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    setZaszlok(res.data);
  } catch (err) {
    console.error("Hiba az admin adatok lekérésekor", err);
  }
};

  useEffect(() => { fetchZaszlok(); }, []);

const handleCreate = async (e) => {
  e.preventDefault();
  try {
    const response = await httpCommon.post("/zaszlok", formData, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    setUzenet(response.data.message);
    setFormData({ orszag: "", kontinens: "Európa", meretId: 1, anyagId: 1, ar: "" });
    fetchZaszlok();
  } catch (err) {
    // Kiírjuk a konkrét hibaüzenetet, amit a backend küld
    const hibaUzenet = err.response?.data?.message || "Szerver hiba történt!";
    setUzenet("Hiba: " + hibaUzenet);
  }
};

  const handleDelete = async (id) => {
    if (window.confirm("Biztosan törlöd?")) {
      try {
        await httpCommon.delete(`/zaszlok/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setUzenet("Törölve!");
        fetchZaszlok();
      } catch (err) { setUzenet("Hiba a törlésnél!"); }
    }
  };

  return (
    <div className="container mt-5 pb-5">
      <h2 className="mb-4">🛡️ Adminisztrációs Felület</h2>
      
      {/* --- ÚJ ZÁSZLÓ FORM --- */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-primary text-white">Új zászló hozzáadása</div>
        <div className="card-body">
          <form onSubmit={handleCreate} className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Ország neve</label>
              <input type="text" className="form-control" value={formData.orszag} required
                onChange={(e) => setFormData({...formData, orszag: e.target.value})} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Kontinens</label>
<select className="form-select" value={formData.kontinens}
  onChange={(e) => setFormData({...formData, kontinens: e.target.value})}>
  <option value="Afrika">Afrika</option>
  <option value="Európa">Európa</option>
  <option value="Ázsia">Ázsia</option>
  <option value="Észak-Amerika">Észak-Amerika</option>
  <option value="Dél-Amerika">Dél-Amerika</option>
  <option value="Óceánia">Óceánia</option>
  <option value="Antarktisz">Antarktisz</option>
</select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Ár (Ft)</label>
              <input type="number" className="form-control" value={formData.ar} required
                onChange={(e) => setFormData({...formData, ar: e.target.value})} />
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button type="submit" className="btn btn-success w-100">Hozzáadás</button>
            </div>
          </form>
        </div>
      </div>

      {uzenet && <div className="alert alert-info">{uzenet}</div>}

      {/* --- TÁBLÁZAT --- */}
      <div className="table-responsive">
        <table className="table table-hover align-middle shadow-sm">
          <thead className="table-dark">
            <tr><th>ID</th><th>Kép</th><th>Ország</th><th className="text-center">Műveletek</th></tr>
          </thead>
          <tbody>
            {zaszlok.map((z) => (
              <tr key={z.id}>
                <td>{z.id}</td>
                <td>
                  <img src={`/images/${z.id}.png`} alt="" style={{ width: "60px" }}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/60x40?text=?'; }} />
                </td>
                <td className="fw-bold">{z.orszag || z.nev}</td>
                <td className="text-center">
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(z.id)}>Törlés</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;