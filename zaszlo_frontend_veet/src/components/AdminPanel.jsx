import { useState, useEffect } from 'react';
import httpCommon from '../http-common.js';

const AdminPanel = ({ accessToken }) => {
  const [zaszlok, setZaszlok] = useState([]);
  const [uzenet, setUzenet] = useState("");

  const fetchZaszlok = async () => {
    try {
      const res = await httpCommon.get("/zaszlok");
      // Ellenőrizzük, mi érkezik a backendről a konzolon
      console.log("Adatok:", res.data);
      setZaszlok(res.data);
    } catch (err) {
      console.error("Hiba a letöltéskor", err);
    }
  };

  useEffect(() => {
    fetchZaszlok();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Biztosan törölni szeretnéd ezt a zászlót?")) {
      try {
        await httpCommon.delete(`/zaszlok/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setUzenet("Sikeres törlés!");
        fetchZaszlok(); 
      } catch (err) {
        setUzenet("Hiba történt a törlés során.");
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">🛡️ Adminisztrációs Felület</h2>
      {uzenet && <div className="alert alert-info">{uzenet}</div>}
      
      <div className="table-responsive">
        <table className="table table-hover shadow-sm align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Kép</th>
              <th>Ország név</th>
              <th className="text-center">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {zaszlok.map((z) => (
              <tr key={z.id}>
                <td>{z.id}</td>
<td>
  <img 
    /* Mivel a képek 1-től 193-ig vannak számozva, 
       a fájlnév megegyezik a termék ID-jával. */
    src={`/images/${z.id}.png`} 
    alt={z.orszag} 
    style={{ 
      width: "70px", 
      height: "45px", 
      objectFit: "cover", 
      borderRadius: "4px", 
      border: "1px solid #ccc" 
    }}
    // Ha véletlenül hiányzik egy szám (pl. nincs 15.png), 
    // akkor egy helyőrző képet mutatunk:
    onError={(e) => { 
      e.target.onerror = null; 
      e.target.src = 'https://via.placeholder.com/70x45?text=Nincs+kép'; 
    }}
  />
</td>
                <td className="fw-bold">
                  {/* Itt próbáljuk ki az orszag és a nev mezőt is, hátha az egyik üres */}
                  {z.orszag || z.nev || "Nincs név megadva"}
                </td>
                <td className="text-center">
                  <button 
                    className="btn btn-danger btn-sm px-3"
                    onClick={() => handleDelete(z.id)}
                  >
                    Törlés
                  </button>
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