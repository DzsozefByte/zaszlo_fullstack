import React, { useEffect, useMemo, useState } from "react";
import httpCommon from "../http-common.js";

const AdminPanel = ({ accessToken }) => {
  const [csoportositott, setCsoportositott] = useState({});
  const [nyitottOrszagok, setNyitottOrszagok] = useState({});
  const [uzenet, setUzenet] = useState({ tipus: "", szoveg: "" });
  const [selectedFile, setSelectedFile] = useState(null);

  const [meta, setMeta] = useState({
    meretek: [],
    anyagok: [],
    kontinensek: [],
  });

  const [felhasznalok, setFelhasznalok] = useState([]);
  const [roleDraft, setRoleDraft] = useState({});

  const [formData, setFormData] = useState({
    orszag: "",
    kontinens: "",
    meretId: "",
    anyagId: "",
    ar: "",
  });

  const [countryEdit, setCountryEdit] = useState({
    orszagId: "",
    orszag: "",
    kontinensId: "",
  });

  const [newMeret, setNewMeret] = useState({
    meret: "",
    szorzo: "1",
  });

  const [newAnyag, setNewAnyag] = useState({
    anyag: "",
    szorzo: "1",
  });

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    [accessToken]
  );

  const orszagLista = useMemo(
    () => Object.values(csoportositott).sort((a, b) => a.nev.localeCompare(b.nev, "hu")),
    [csoportositott]
  );

  const hibaUzenet = (err, fallbackText) =>
    err?.response?.data?.message || fallbackText;

  const showMessage = (tipus, szoveg) => {
    setUzenet({ tipus, szoveg });
  };

  const csoportositas = (adatok) => {
    const map = {};
    adatok.forEach((item) => {
      if (!map[item.orszag]) {
        map[item.orszag] = {
          nev: item.orszag,
          kontinens: item.kontinens,
          orszagId: item.orszagId,
          variaciok: [],
        };
      }
      map[item.orszag].variaciok.push(item);
    });
    setCsoportositott(map);
  };

  const fetchZaszlok = async () => {
    const res = await httpCommon.get("/zaszlok/admin-list", authConfig);
    csoportositas(res.data || []);
  };

  const fetchMeta = async () => {
    const res = await httpCommon.get("/zaszlok/admin/meta", authConfig);
    const metaData = res.data || { meretek: [], anyagok: [], kontinensek: [] };
    setMeta(metaData);

    setFormData((prev) => ({
      ...prev,
      kontinens: prev.kontinens || metaData.kontinensek[0]?.kontinens || "",
      meretId: prev.meretId || metaData.meretek[0]?.id || "",
      anyagId: prev.anyagId || metaData.anyagok[0]?.id || "",
    }));

    setCountryEdit((prev) => ({
      ...prev,
      kontinensId: prev.kontinensId || String(metaData.kontinensek[0]?.id || ""),
    }));
  };

  const fetchFelhasznalok = async () => {
    const res = await httpCommon.get("/auth/admin/users", authConfig);
    const users = res.data?.users || [];
    setFelhasznalok(users);
    setRoleDraft(
      users.reduce((acc, user) => {
        acc[user.id] = user.jogosultsag;
        return acc;
      }, {})
    );
  };

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchMeta(), fetchZaszlok(), fetchFelhasznalok()]);
      } catch (err) {
        showMessage("danger", hibaUzenet(err, "Hiba a kezdo adatok betoltese soran."));
      }
    };

    if (accessToken) {
      load();
    }
  }, [accessToken]);

  const toggleRow = (orszagNev) => {
    setNyitottOrszagok((prev) => ({ ...prev, [orszagNev]: !prev[orszagNev] }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    showMessage("info", "Feldolgozas...");

    try {
      const payload = {
        ...formData,
        meretId: Number(formData.meretId),
        anyagId: Number(formData.anyagId),
      };

      const res = await httpCommon.post("/zaszlok", payload, authConfig);

      if (selectedFile && res.data?.orszagId) {
        const imageData = new FormData();
        imageData.append("image", selectedFile);
        await httpCommon.post(`/zaszlok/upload/${res.data.orszagId}`, imageData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setFormData((prev) => ({
        ...prev,
        orszag: "",
      }));
      setSelectedFile(null);
      const fileInput = document.getElementById("fileInput");
      if (fileInput) {
        fileInput.value = "";
      }

      await fetchZaszlok();
      showMessage("success", "Zaszlo sikeresen hozzaadva.");
    } catch (err) {
      showMessage("danger", hibaUzenet(err, "Hiba tortent a zaszlo mentese kozben."));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Biztosan torolni szeretned ezt a variaciot?")) {
      return;
    }

    try {
      await httpCommon.delete(`/zaszlok/${id}`, authConfig);
      await fetchZaszlok();
      showMessage("success", "Variacio sikeresen torolve.");
    } catch (err) {
      showMessage("danger", hibaUzenet(err, "Hiba a torles soran."));
    }
  };

  const handleCountrySelect = (orszagId) => {
    const selected = orszagLista.find((o) => String(o.orszagId) === String(orszagId));
    if (!selected) {
      setCountryEdit({ orszagId: "", orszag: "", kontinensId: "" });
      return;
    }

    const kontId =
      meta.kontinensek.find((k) => k.kontinens === selected.kontinens)?.id ||
      meta.kontinensek[0]?.id ||
      "";

    setCountryEdit({
      orszagId: String(selected.orszagId),
      orszag: selected.nev,
      kontinensId: String(kontId),
    });
  };

  const handleCountryUpdate = async (e) => {
    e.preventDefault();
    if (!countryEdit.orszagId) {
      showMessage("warning", "Eloszor valassz egy orszagot.");
      return;
    }

    try {
      await httpCommon.put(
        `/zaszlok/admin/countries/${countryEdit.orszagId}`,
        {
          orszag: countryEdit.orszag,
          kontinensId: Number(countryEdit.kontinensId),
        },
        authConfig
      );

      await fetchZaszlok();
      showMessage("success", "Orszag adatai sikeresen modositva.");
    } catch (err) {
      showMessage("danger", hibaUzenet(err, "Hiba tortent az orszag modositasa soran."));
    }
  };

  const handleCreateMeret = async (e) => {
    e.preventDefault();

    try {
      await httpCommon.post(
        "/zaszlok/admin/sizes",
        {
          meret: newMeret.meret,
          szorzo: Number(newMeret.szorzo),
        },
        authConfig
      );

      setNewMeret({ meret: "", szorzo: "1" });
      await fetchMeta();
      showMessage("success", "Uj meret sikeresen letrehozva.");
    } catch (err) {
      showMessage("danger", hibaUzenet(err, "Hiba tortent az uj meret mentesekor."));
    }
  };

  const handleCreateAnyag = async (e) => {
    e.preventDefault();

    try {
      await httpCommon.post(
        "/zaszlok/admin/materials",
        {
          anyag: newAnyag.anyag,
          szorzo: Number(newAnyag.szorzo),
        },
        authConfig
      );

      setNewAnyag({ anyag: "", szorzo: "1" });
      await fetchMeta();
      showMessage("success", "Uj anyag sikeresen letrehozva.");
    } catch (err) {
      showMessage("danger", hibaUzenet(err, "Hiba tortent az uj anyag mentesekor."));
    }
  };

  const handleRoleSave = async (userId) => {
    try {
      await httpCommon.put(
        `/auth/admin/users/${userId}/role`,
        { jogosultsag: roleDraft[userId] },
        authConfig
      );
      await fetchFelhasznalok();
      showMessage("success", `Felhasznalo (#${userId}) jogosultsaga frissitve.`);
    } catch (err) {
      showMessage("danger", hibaUzenet(err, "Hiba tortent a jogosultsag modositasakor."));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Biztosan torolni szeretned ezt a felhasznalot?")) {
      return;
    }

    try {
      await httpCommon.delete(`/auth/admin/users/${userId}`, authConfig);
      await fetchFelhasznalok();
      showMessage("success", `Felhasznalo (#${userId}) torolve.`);
    } catch (err) {
      showMessage("danger", hibaUzenet(err, "Hiba tortent a felhasznalo torlesekor."));
    }
  };

  return (
    <div className="container mt-5 pb-5">
      <h2 className="mb-4">Adminisztracios felulet</h2>

      {uzenet.szoveg && <div className={`alert alert-${uzenet.tipus}`}>{uzenet.szoveg}</div>}

      <div className="card shadow-sm mb-4 border-0">
        <div className="card-header bg-primary text-white fw-bold">Uj zaszlo hozzaadasa</div>
        <div className="card-body bg-light">
          <form onSubmit={handleCreate} className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-bold">Orszag neve</label>
              <input
                type="text"
                className="form-control"
                value={formData.orszag}
                required
                onChange={(e) => setFormData((prev) => ({ ...prev, orszag: e.target.value }))}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label fw-bold">Kontinens</label>
              <select
                className="form-select"
                value={formData.kontinens}
                onChange={(e) => setFormData((prev) => ({ ...prev, kontinens: e.target.value }))}
                required
              >
                {meta.kontinensek.map((k) => (
                  <option key={k.id} value={k.kontinens}>
                    {k.kontinens}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-bold">Meret</label>
              <select
                className="form-select"
                value={formData.meretId}
                onChange={(e) => setFormData((prev) => ({ ...prev, meretId: e.target.value }))}
                required
              >
                {meta.meretek.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.meret}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-bold">Anyag</label>
              <select
                className="form-select"
                value={formData.anyagId}
                onChange={(e) => setFormData((prev) => ({ ...prev, anyagId: e.target.value }))}
                required
              >
                {meta.anyagok.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.anyag}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-bold">Kep (.png)</label>
              <input
                type="file"
                id="fileInput"
                className="form-control"
                accept="image/png"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="col-12 text-end">
              <button type="submit" className="btn btn-success px-4">
                Hozzaadas
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-warning-subtle fw-bold">Adott orszag modositasa</div>
            <div className="card-body">
              <form onSubmit={handleCountryUpdate} className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-bold">Orszag kivalasztasa</label>
                  <select
                    className="form-select"
                    value={countryEdit.orszagId}
                    onChange={(e) => handleCountrySelect(e.target.value)}
                  >
                    <option value="">Valassz orszagot...</option>
                    {orszagLista.map((o) => (
                      <option key={o.orszagId} value={o.orszagId}>
                        {o.nev}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-7">
                  <label className="form-label fw-bold">Uj orszagnev</label>
                  <input
                    type="text"
                    className="form-control"
                    value={countryEdit.orszag}
                    onChange={(e) =>
                      setCountryEdit((prev) => ({ ...prev, orszag: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="col-md-5">
                  <label className="form-label fw-bold">Kontinens</label>
                  <select
                    className="form-select"
                    value={countryEdit.kontinensId}
                    onChange={(e) =>
                      setCountryEdit((prev) => ({ ...prev, kontinensId: e.target.value }))
                    }
                    required
                  >
                    {meta.kontinensek.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.kontinens}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 text-end">
                  <button type="submit" className="btn btn-warning">
                    Orszag mentese
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-info-subtle fw-bold">
              Alapadat modositasa (uj meret, uj anyag)
            </div>
            <div className="card-body">
              <form onSubmit={handleCreateMeret} className="row g-2 align-items-end mb-3">
                <div className="col-6">
                  <label className="form-label fw-bold">Uj meret</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="pl. 400x200cm"
                    value={newMeret.meret}
                    onChange={(e) =>
                      setNewMeret((prev) => ({ ...prev, meret: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="col-3">
                  <label className="form-label fw-bold">Szorzo</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    className="form-control"
                    value={newMeret.szorzo}
                    onChange={(e) =>
                      setNewMeret((prev) => ({ ...prev, szorzo: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="col-3 d-grid">
                  <button type="submit" className="btn btn-info">
                    Meret rogzitese
                  </button>
                </div>
              </form>

              <form onSubmit={handleCreateAnyag} className="row g-2 align-items-end">
                <div className="col-6">
                  <label className="form-label fw-bold">Uj anyag</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="pl. pamut"
                    value={newAnyag.anyag}
                    onChange={(e) =>
                      setNewAnyag((prev) => ({ ...prev, anyag: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="col-3">
                  <label className="form-label fw-bold">Szorzo</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    className="form-control"
                    value={newAnyag.szorzo}
                    onChange={(e) =>
                      setNewAnyag((prev) => ({ ...prev, szorzo: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="col-3 d-grid">
                  <button type="submit" className="btn btn-info">
                    Anyag rogzitese
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4 border-0">
        <div className="card-header bg-secondary text-white fw-bold">Felhasznalok kezelese</div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm table-striped align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nev</th>
                  <th>Email</th>
                  <th>Telefonszam</th>
                  <th>Jogosultsag</th>
                  <th className="text-end">Muvelet</th>
                </tr>
              </thead>
              <tbody>
                {felhasznalok.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nev}</td>
                    <td>{u.email}</td>
                    <td>{u.telefonszam || "-"}</td>
                    <td style={{ maxWidth: 180 }}>
                      <select
                        className="form-select form-select-sm"
                        value={roleDraft[u.id] || u.jogosultsag}
                        onChange={(e) =>
                          setRoleDraft((prev) => ({ ...prev, [u.id]: e.target.value }))
                        }
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        disabled={(roleDraft[u.id] || u.jogosultsag) === u.jogosultsag}
                        onClick={() => handleRoleSave(u.id)}
                      >
                        Mentes
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        Torles
                      </button>
                    </td>
                  </tr>
                ))}
                {felhasznalok.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Nincs megjelenitheto felhasznalo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="table-responsive shadow-sm">
        <table className="table table-hover align-middle mb-0 bg-white">
          <thead className="table-dark">
            <tr>
              <th style={{ width: "50px" }} />
              <th>Kep</th>
              <th>Orszag</th>
              <th>Kontinens</th>
              <th className="text-center">Variaciok</th>
            </tr>
          </thead>
          <tbody>
            {orszagLista.map((csoport) => (
              <React.Fragment key={csoport.nev}>
                <tr onClick={() => toggleRow(csoport.nev)} style={{ cursor: "pointer" }}>
                  <td className="text-center">{nyitottOrszagok[csoport.nev] ? "▼" : "▶"}</td>
                  <td>
                    <img
                      src={`/images/${csoport.orszagId}.png`}
                      alt=""
                      style={{
                        width: "45px",
                        height: "30px",
                        objectFit: "cover",
                        border: "1px solid #ccc",
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='45' height='30'%3E%3Crect width='45' height='30' fill='%23f0f0f0'/%3E%3Ctext x='22.5' y='18' text-anchor='middle' font-size='12' fill='%23666'%3E?%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </td>
                  <td className="fw-bold">{csoport.nev}</td>
                  <td>{csoport.kontinens}</td>
                  <td className="text-center">
                    <span className="badge bg-secondary">{csoport.variaciok.length} db</span>
                  </td>
                </tr>

                {nyitottOrszagok[csoport.nev] && (
                  <tr>
                    <td colSpan="5" className="p-0">
                      <div className="p-3 bg-light">
                        <table className="table table-sm table-bordered bg-white mb-0">
                          <thead>
                            <tr className="table-secondary">
                              <th>ID</th>
                              <th>Meret</th>
                              <th>Anyag</th>
                              <th className="text-center">Muvelet</th>
                            </tr>
                          </thead>
                          <tbody>
                            {csoport.variaciok.map((v) => (
                              <tr key={v.id}>
                                <td>{v.id}</td>
                                <td>{v.meret_nev}</td>
                                <td>{v.anyag_nev}</td>
                                <td className="text-center">
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleDelete(v.id)}
                                  >
                                    Torles
                                  </button>
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
