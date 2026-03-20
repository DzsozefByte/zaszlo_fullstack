import React, { useEffect, useMemo, useState } from "react";
import httpCommon from "../http-common.js";
import "./AdminPanel.css";

const AdminPanel = ({ accessToken }) => {
  const [csoportositott, setCsoportositott] = useState({});
  const [nyitottOrszagok, setNyitottOrszagok] = useState({});
  const [uzenet, setUzenet] = useState({ tipus: "", szoveg: "" });
  const [selectedFile, setSelectedFile] = useState(null);

  const [meta, setMeta] = useState({ meretek: [], anyagok: [], kontinensek: [] });
  const [felhasznalok, setFelhasznalok] = useState([]);
  const [roleDraft, setRoleDraft] = useState({});
  const [meretDrafts, setMeretDrafts] = useState({});
  const [anyagDrafts, setAnyagDrafts] = useState({});

  const [bulkForm, setBulkForm] = useState({
    orszag: "",
    kontinensId: "",
    meretIds: [],
    anyagIds: [],
    useAllMeretek: true,
    useAllAnyagok: true,
  });

  const [countryEdit, setCountryEdit] = useState({
    orszagId: "",
    orszag: "",
    kontinensId: "",
  });

  const [newMeret, setNewMeret] = useState({ meret: "", szorzo: "1" });
  const [newAnyag, setNewAnyag] = useState({ anyag: "", szorzo: "1" });

  const authConfig = useMemo(
    () => ({ headers: { Authorization: `Bearer ${accessToken}` } }),
    [accessToken]
  );

  const orszagLista = useMemo(
    () => Object.values(csoportositott).sort((a, b) => a.nev.localeCompare(b.nev, "hu")),
    [csoportositott]
  );

  const extractError = (err, fallback) => err?.response?.data?.message || fallback;

  const showMessage = (tipus, szoveg) => {
    setUzenet({ tipus, szoveg });
  };

  const initMeretDrafts = (meretek) => {
    setMeretDrafts(
      meretek.reduce((acc, meret) => {
        acc[meret.id] = { meret: meret.meret, szorzo: String(meret.szorzo ?? "1") };
        return acc;
      }, {})
    );
  };

  const initAnyagDrafts = (anyagok) => {
    setAnyagDrafts(
      anyagok.reduce((acc, anyag) => {
        acc[anyag.id] = { anyag: anyag.anyag, szorzo: String(anyag.szorzo ?? "1") };
        return acc;
      }, {})
    );
  };

  const csoportositas = (adatok) => {
    const map = {};
    adatok.forEach((item) => {
      const key = `${item.orszag}-${item.orszagId}`;
      if (!map[key]) {
        map[key] = {
          nev: item.orszag,
          kontinens: item.kontinens,
          orszagId: item.orszagId,
          variaciok: [],
        };
      }
      map[key].variaciok.push(item);
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
    initMeretDrafts(metaData.meretek || []);
    initAnyagDrafts(metaData.anyagok || []);

    setBulkForm((prev) => ({
      ...prev,
      kontinensId: prev.kontinensId || String(metaData.kontinensek[0]?.id || ""),
      meretIds: prev.meretIds.length ? prev.meretIds : metaData.meretek.slice(0, 1).map((m) => m.id),
      anyagIds: prev.anyagIds.length ? prev.anyagIds : metaData.anyagok.slice(0, 1).map((a) => a.id),
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
    const loadData = async () => {
      try {
        await Promise.all([fetchMeta(), fetchZaszlok(), fetchFelhasznalok()]);
      } catch (err) {
        showMessage("danger", extractError(err, "Hiba a kezdő adatok betöltése során."));
      }
    };

    if (accessToken) {
      loadData();
    }
  }, [accessToken]);

  const toggleRow = (orszagId) => {
    setNyitottOrszagok((prev) => ({ ...prev, [orszagId]: !prev[orszagId] }));
  };

  const toggleBulkSelection = (key, id) => {
    setBulkForm((prev) => {
      const set = new Set(prev[key]);
      if (set.has(id)) {
        set.delete(id);
      } else {
        set.add(id);
      }
      return { ...prev, [key]: [...set] };
    });
  };

  const handleBulkCreate = async (e) => {
    e.preventDefault();
    showMessage("info", "Feldolgozás...");

    const meretIds = bulkForm.useAllMeretek
      ? meta.meretek.map((meret) => meret.id)
      : bulkForm.meretIds;
    const anyagIds = bulkForm.useAllAnyagok
      ? meta.anyagok.map((anyag) => anyag.id)
      : bulkForm.anyagIds;

    if (!meretIds.length || !anyagIds.length) {
      showMessage("warning", "Válassz legalább 1 méretet és 1 anyagot.");
      return;
    }

    try {
      const res = await httpCommon.post(
        "/zaszlok/admin/bulk-create",
        {
          orszag: bulkForm.orszag,
          kontinensId: Number(bulkForm.kontinensId),
          meretIds,
          anyagIds,
        },
        authConfig
      );

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

      setBulkForm((prev) => ({ ...prev, orszag: "" }));
      setSelectedFile(null);
      const fileInput = document.getElementById("admin-file-input");
      if (fileInput) {
        fileInput.value = "";
      }

      await fetchZaszlok();
      showMessage(
        "success",
        `Kész. Létrejött: ${res.data?.createdCount || 0} variáció, átugorva: ${
          res.data?.skippedCount || 0
        }.`
      );
    } catch (err) {
      showMessage("danger", extractError(err, "Hiba történt a variációk létrehozásakor."));
    }
  };

  const handleDeleteVariant = async (id) => {
    if (!window.confirm("Biztosan törölni szeretnéd ezt a variációt?")) {
      return;
    }
    try {
      await httpCommon.delete(`/zaszlok/${id}`, authConfig);
      await fetchZaszlok();
      showMessage("success", "Variáció sikeresen törölve.");
    } catch (err) {
      showMessage("danger", extractError(err, "Hiba a törlés során."));
    }
  };

  const handleCountrySelect = (orszagId) => {
    const selected = orszagLista.find((item) => String(item.orszagId) === String(orszagId));
    if (!selected) {
      setCountryEdit({ orszagId: "", orszag: "", kontinensId: "" });
      return;
    }

    const kontinensId =
      meta.kontinensek.find((kont) => kont.kontinens === selected.kontinens)?.id ||
      meta.kontinensek[0]?.id ||
      "";

    setCountryEdit({
      orszagId: String(selected.orszagId),
      orszag: selected.nev,
      kontinensId: String(kontinensId),
    });
  };

  const handleCountryUpdate = async (e) => {
    e.preventDefault();
    if (!countryEdit.orszagId) {
      showMessage("warning", "Válassz országot a módosítás előtt.");
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
      showMessage("success", "Ország adatai sikeresen módosítva.");
    } catch (err) {
      showMessage("danger", extractError(err, "Hiba történt az ország módosításakor."));
    }
  };

  const handleDeleteCountry = async (orszagId, orszagNev) => {
    if (
      !window.confirm(
        `Biztosan törölni szeretnéd a(z) ${orszagNev} országot az összes variációjával együtt?`
      )
    ) {
      return;
    }

    try {
      await httpCommon.delete(`/zaszlok/admin/countries/${orszagId}`, authConfig);
      await Promise.all([fetchZaszlok(), fetchMeta()]);
      if (String(countryEdit.orszagId) === String(orszagId)) {
        setCountryEdit({ orszagId: "", orszag: "", kontinensId: "" });
      }
      showMessage("success", `${orszagNev} és minden variációja törölve.`);
    } catch (err) {
      showMessage("danger", extractError(err, "Hiba történt az ország tömeges törlése során."));
    }
  };

  const handleCreateMeret = async (e) => {
    e.preventDefault();
    try {
      await httpCommon.post(
        "/zaszlok/admin/sizes",
        { meret: newMeret.meret, szorzo: Number(newMeret.szorzo) },
        authConfig
      );
      setNewMeret({ meret: "", szorzo: "1" });
      await fetchMeta();
      showMessage("success", "Új méret sikeresen létrehozva.");
    } catch (err) {
      showMessage("danger", extractError(err, "Hiba történt az új méret mentése során."));
    }
  };

  const handleUpdateMeret = async (id) => {
    const draft = meretDrafts[id];
    if (!draft) {
      return;
    }
    try {
      await httpCommon.put(
        `/zaszlok/admin/sizes/${id}`,
        { meret: draft.meret, szorzo: Number(draft.szorzo) },
        authConfig
      );
      await fetchMeta();
      showMessage("success", `Méret (#${id}) sikeresen módosítva.`);
    } catch (err) {
      showMessage("danger", extractError(err, "Hiba történt a méret módosításakor."));
    }
  };

  const handleDeleteMeret = async (id) => {
    if (!window.confirm(`Biztosan törölni szeretnéd a(z) #${id} méretet?`)) {
      return;
    }
    try {
      await httpCommon.delete(`/zaszlok/admin/sizes/${id}`, authConfig);
      await Promise.all([fetchMeta(), fetchZaszlok()]);
      showMessage("success", `Méret (#${id}) törölve.`);
    } catch (err) {
      showMessage("danger", extractError(err, "Hiba történt a méret törlésekor."));
    }
  };

  const handleCreateAnyag = async (e) => {
    e.preventDefault();
    try {
      await httpCommon.post(
        "/zaszlok/admin/materials",
        { anyag: newAnyag.anyag, szorzo: Number(newAnyag.szorzo) },
        authConfig
      );
      setNewAnyag({ anyag: "", szorzo: "1" });
      await fetchMeta();
      showMessage("success", "Új anyag sikeresen létrehozva.");
    } catch (err) {
      showMessage("danger", extractError(err, "Hiba történt az új anyag mentése során."));
    }
  };

  const handleUpdateAnyag = async (id) => {
    const draft = anyagDrafts[id];
    if (!draft) {
      return;
    }
    try {
      await httpCommon.put(
        `/zaszlok/admin/materials/${id}`,
        { anyag: draft.anyag, szorzo: Number(draft.szorzo) },
        authConfig
      );
      await fetchMeta();
      showMessage("success", `Anyag (#${id}) sikeresen módosítva.`);
    } catch (err) {
      showMessage("danger", extractError(err, "Hiba történt az anyag módosításakor."));
    }
  };

  const handleDeleteAnyag = async (id) => {
    if (!window.confirm(`Biztosan törölni szeretnéd a(z) #${id} anyagot?`)) {
      return;
    }
    try {
      await httpCommon.delete(`/zaszlok/admin/materials/${id}`, authConfig);
      await Promise.all([fetchMeta(), fetchZaszlok()]);
      showMessage("success", `Anyag (#${id}) törölve.`);
    } catch (err) {
      showMessage("danger", extractError(err, "Hiba történt az anyag törlésekor."));
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
      showMessage("success", `Felhasználó (#${userId}) jogosultsága frissítve.`);
    } catch (err) {
      showMessage("danger", extractError(err, "Hiba történt a jogosultság módosításakor."));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Biztosan törölni szeretnéd ezt a felhasználót?")) {
      return;
    }
    try {
      await httpCommon.delete(`/auth/admin/users/${userId}`, authConfig);
      await fetchFelhasznalok();
      showMessage("success", `Felhasználó (#${userId}) törölve.`);
    } catch (err) {
      showMessage("danger", extractError(err, "Hiba történt a felhasználó törlésekor."));
    }
  };

  return (
    <div className="admin-shell">
      <div className="admin-orb admin-orb-one" />
      <div className="admin-orb admin-orb-two" />

      <div className="container-fluid px-3 px-lg-4 admin-container">
        <header className="admin-hero">
          <p className="admin-eyebrow">Admin Studio</p>
          <h1>Zászló adminisztráció</h1>
          <p className="admin-subtitle">
            Szerkeszd a bázisadatokat, kezeld a felhasználókat, és hozz létre tömegesen
            variációkat.
          </p>
        </header>

        {uzenet.szoveg && (
          <div className={`alert alert-${uzenet.tipus} admin-alert`} role="alert">
            {uzenet.szoveg}
          </div>
        )}

        <section className="admin-grid admin-grid-two mb-4">
          <article className="admin-card">
            <div className="admin-card-header">
              <h2>Új custom zászló variációk egyszerre</h2>
              <p>Nem kell egyesével felvenni a méret-anyag kombinációkat.</p>
            </div>

            <form onSubmit={handleBulkCreate} className="row g-3">
              <div className="col-lg-4">
                <label className="form-label fw-semibold">Ország neve</label>
                <input
                  type="text"
                  className="form-control"
                  value={bulkForm.orszag}
                  onChange={(e) => setBulkForm((prev) => ({ ...prev, orszag: e.target.value }))}
                  placeholder="pl. Tesztország"
                  required
                />
              </div>

              <div className="col-lg-3">
                <label className="form-label fw-semibold">Kontinens</label>
                <select
                  className="form-select"
                  value={bulkForm.kontinensId}
                  onChange={(e) => setBulkForm((prev) => ({ ...prev, kontinensId: e.target.value }))}
                  required
                >
                  {meta.kontinensek.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.kontinens}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-lg-5">
                <label className="form-label fw-semibold">Ország kép (.png)</label>
                <input
                  id="admin-file-input"
                  type="file"
                  className="form-control"
                  accept="image/png"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="col-md-6">
                <div className="admin-pick-box">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h3>Méretek</h3>
                    <label className="form-check-label small d-flex align-items-center gap-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={bulkForm.useAllMeretek}
                        onChange={(e) =>
                          setBulkForm((prev) => ({ ...prev, useAllMeretek: e.target.checked }))
                        }
                      />
                      Mind
                    </label>
                  </div>
                  <div className="admin-chip-wrap">
                    {meta.meretek.map((item) => {
                      const active = bulkForm.meretIds.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`admin-chip ${active ? "is-active" : ""}`}
                          disabled={bulkForm.useAllMeretek}
                          onClick={() => toggleBulkSelection("meretIds", item.id)}
                        >
                          {item.meret}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="admin-pick-box">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h3>Anyagok</h3>
                    <label className="form-check-label small d-flex align-items-center gap-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={bulkForm.useAllAnyagok}
                        onChange={(e) =>
                          setBulkForm((prev) => ({ ...prev, useAllAnyagok: e.target.checked }))
                        }
                      />
                      Mind
                    </label>
                  </div>
                  <div className="admin-chip-wrap">
                    {meta.anyagok.map((item) => {
                      const active = bulkForm.anyagIds.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`admin-chip ${active ? "is-active" : ""}`}
                          disabled={bulkForm.useAllAnyagok}
                          onClick={() => toggleBulkSelection("anyagIds", item.id)}
                        >
                          {item.anyag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="col-12 text-end">
                <button type="submit" className="btn admin-btn-primary">
                  Variációk létrehozása
                </button>
              </div>
            </form>
          </article>

          <article className="admin-card">
            <div className="admin-card-header">
              <h2>Adott ország módosítása</h2>
              <p>Országnév és kontinens változtatása egy lépésben.</p>
            </div>

            <form onSubmit={handleCountryUpdate} className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Ország kiválasztása</label>
                <select
                  className="form-select"
                  value={countryEdit.orszagId}
                  onChange={(e) => handleCountrySelect(e.target.value)}
                >
                  <option value="">Válassz országot...</option>
                  {orszagLista.map((item) => (
                    <option key={item.orszagId} value={item.orszagId}>
                      {item.nev}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-7">
                <label className="form-label fw-semibold">Ország neve</label>
                <input
                  type="text"
                  className="form-control"
                  value={countryEdit.orszag}
                  onChange={(e) => setCountryEdit((prev) => ({ ...prev, orszag: e.target.value }))}
                  required
                />
              </div>

              <div className="col-5">
                <label className="form-label fw-semibold">Kontinens</label>
                <select
                  className="form-select"
                  value={countryEdit.kontinensId}
                  onChange={(e) =>
                    setCountryEdit((prev) => ({ ...prev, kontinensId: e.target.value }))
                  }
                  required
                >
                  {meta.kontinensek.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.kontinens}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  disabled={!countryEdit.orszagId}
                  onClick={() => handleDeleteCountry(countryEdit.orszagId, countryEdit.orszag)}
                >
                  Ország törlése
                </button>
                <button type="submit" className="btn admin-btn-secondary">
                  Ország mentése
                </button>
              </div>
            </form>
          </article>
        </section>

        <section className="admin-grid admin-grid-two mb-4">
          <article className="admin-card">
            <div className="admin-card-header">
              <h2>Alapadatok módosítása</h2>
              <p>Méret és anyag alapadatok kezelése egy helyen.</p>
            </div>

            <div className="row g-4">
              <div className="col-12 col-xl-6">
                <h3 className="admin-section-title">Méretek</h3>

                <form onSubmit={handleCreateMeret} className="row g-2 mb-3">
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Új méret (pl. 400x200cm)"
                      value={newMeret.meret}
                      onChange={(e) => setNewMeret((prev) => ({ ...prev, meret: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-3">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      className="form-control"
                      placeholder="Szorzó"
                      value={newMeret.szorzo}
                      onChange={(e) => setNewMeret((prev) => ({ ...prev, szorzo: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-3 d-grid">
                    <button type="submit" className="btn btn-outline-primary btn-sm">
                      Új méret
                    </button>
                  </div>
                </form>

                <div className="table-responsive admin-subtable">
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Méret</th>
                        <th>Szorzó</th>
                        <th className="text-end">Művelet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meta.meretek.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>
                            <input
                              className="form-control form-control-sm"
                              value={meretDrafts[item.id]?.meret || ""}
                              onChange={(e) =>
                                setMeretDrafts((prev) => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], meret: e.target.value },
                                }))
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              className="form-control form-control-sm"
                              value={meretDrafts[item.id]?.szorzo || "1"}
                              onChange={(e) =>
                                setMeretDrafts((prev) => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], szorzo: e.target.value },
                                }))
                              }
                            />
                          </td>
                          <td className="text-end">
                            <div className="d-flex gap-1 justify-content-end">
                              <button
                                type="button"
                                className="btn btn-outline-success btn-sm"
                                onClick={() => handleUpdateMeret(item.id)}
                              >
                                Mentés
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteMeret(item.id)}
                              >
                                Törlés
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="col-12 col-xl-6">
                <h3 className="admin-section-title">Anyagok</h3>

                <form onSubmit={handleCreateAnyag} className="row g-2 mb-3">
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Új anyag (pl. pamut)"
                      value={newAnyag.anyag}
                      onChange={(e) => setNewAnyag((prev) => ({ ...prev, anyag: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-3">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      className="form-control"
                      placeholder="Szorzó"
                      value={newAnyag.szorzo}
                      onChange={(e) => setNewAnyag((prev) => ({ ...prev, szorzo: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-3 d-grid">
                    <button type="submit" className="btn btn-outline-primary btn-sm">
                      Új anyag
                    </button>
                  </div>
                </form>

                <div className="table-responsive admin-subtable">
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Anyag</th>
                        <th>Szorzó</th>
                        <th className="text-end">Művelet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meta.anyagok.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>
                            <input
                              className="form-control form-control-sm"
                              value={anyagDrafts[item.id]?.anyag || ""}
                              onChange={(e) =>
                                setAnyagDrafts((prev) => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], anyag: e.target.value },
                                }))
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              className="form-control form-control-sm"
                              value={anyagDrafts[item.id]?.szorzo || "1"}
                              onChange={(e) =>
                                setAnyagDrafts((prev) => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], szorzo: e.target.value },
                                }))
                              }
                            />
                          </td>
                          <td className="text-end">
                            <div className="d-flex gap-1 justify-content-end">
                              <button
                                type="button"
                                className="btn btn-outline-success btn-sm"
                                onClick={() => handleUpdateAnyag(item.id)}
                              >
                                Mentés
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteAnyag(item.id)}
                              >
                                Törlés
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </article>

          <article className="admin-card">
            <div className="admin-card-header">
              <h2>Felhasználók kezelése</h2>
              <p>Szerepkör módosítás és törlés egy helyen.</p>
            </div>

            <div className="table-responsive">
              <table className="table table-sm align-middle admin-user-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Név</th>
                    <th>Email</th>
                    <th>Jogosultság</th>
                    <th className="text-end">Művelet</th>
                  </tr>
                </thead>
                <tbody>
                  {felhasznalok.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.nev}</td>
                      <td>{item.email}</td>
                      <td style={{ maxWidth: 120 }}>
                        <select
                          className="form-select form-select-sm"
                          value={roleDraft[item.id] || item.jogosultsag}
                          onChange={(e) => setRoleDraft((prev) => ({ ...prev, [item.id]: e.target.value }))}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm me-2"
                          disabled={(roleDraft[item.id] || item.jogosultsag) === item.jogosultsag}
                          onClick={() => handleRoleSave(item.id)}
                        >
                          Mentés
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteUser(item.id)}
                        >
                          Törlés
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!felhasznalok.length && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        Nincs felhasználó.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <section className="admin-card mb-4">
          <div className="admin-card-header">
            <h2>Országok és variációk</h2>
            <p>Nyisd le az országot a méret/anyag variációk gyors törléséhez.</p>
          </div>

          <div className="table-responsive">
            <table className="table align-middle admin-flag-table mb-0">
              <thead>
                <tr>
                  <th style={{ width: 56 }} />
                  <th>Kép</th>
                  <th>Ország</th>
                  <th>Kontinens</th>
                  <th className="text-center">Variáció</th>
                  <th className="text-end">Művelet</th>
                </tr>
              </thead>
              <tbody>
                {orszagLista.map((csoport) => (
                  <React.Fragment key={`${csoport.nev}-${csoport.orszagId}`}>
                    <tr className="admin-flag-row" onClick={() => toggleRow(csoport.orszagId)}>
                      <td className="text-center">{nyitottOrszagok[csoport.orszagId] ? "v" : ">"}</td>
                      <td>
                        <img
                          src={`/images/${csoport.orszagId}.png`}
                          alt={csoport.nev}
                          className="admin-flag-thumb"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='36'%3E%3Crect width='56' height='36' fill='%23e5e7eb'/%3E%3Ctext x='28' y='22' text-anchor='middle' font-size='12' fill='%2363748b'%3E?%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </td>
                      <td className="fw-semibold">{csoport.nev}</td>
                      <td>{csoport.kontinens}</td>
                      <td className="text-center">
                        <span className="badge admin-pill">{csoport.variaciok.length} db</span>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCountry(csoport.orszagId, csoport.nev);
                          }}
                        >
                          Ország törlése
                        </button>
                      </td>
                    </tr>

                    {nyitottOrszagok[csoport.orszagId] && (
                      <tr>
                        <td colSpan="6" className="p-0">
                          <div className="p-3 bg-body-tertiary">
                            <table className="table table-sm table-bordered mb-0 bg-white">
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Méret</th>
                                  <th>Anyag</th>
                                  <th className="text-end">Művelet</th>
                                </tr>
                              </thead>
                              <tbody>
                                {csoport.variaciok.map((item) => (
                                  <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.meret_nev}</td>
                                    <td>{item.anyag_nev}</td>
                                    <td className="text-end">
                                      <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleDeleteVariant(item.id)}
                                      >
                                        Törlés
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
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;

