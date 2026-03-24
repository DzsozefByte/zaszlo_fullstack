import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Container, Spinner, Table } from "react-bootstrap";
import httpCommon from "../http-common";
import "./Szamlak.css";

const Szamlak = ({ accessToken, user }) => {
  const [szamlak, setSzamlak] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nyitottSzamlak, setNyitottSzamlak] = useState({});

  const [adminSzamlak, setAdminSzamlak] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState(null);
  const [nyitottAdminSzamlak, setNyitottAdminSzamlak] = useState({});

  const [fizetesiModok, setFizetesiModok] = useState([]);
  const [ujFizetesiModNev, setUjFizetesiModNev] = useState("");
  const [uzenet, setUzenet] = useState({ tipus: "", szoveg: "" });

  const isAdmin = user?.szerep === "admin" || user?.jogosultsag === "admin";

  const authConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
    [accessToken]
  );

  const extractError = (err, fallback) => err?.response?.data?.message || fallback;
  const formatDate = (value) => (value ? new Date(value).toLocaleDateString("hu-HU") : "-");
  const formatCurrency = (value) => `${Number(value || 0).toLocaleString("hu-HU")} Ft`;

  const showMessage = (tipus, szoveg) => {
    setUzenet({ tipus, szoveg });
  };

  const fetchSajatSzamlak = useCallback(async () => {
    const response = await httpCommon.get("/szamlak", authConfig);
    setSzamlak(Array.isArray(response.data) ? response.data : []);
  }, [authConfig]);

  const fetchAdminSzamlak = useCallback(async () => {
    const response = await httpCommon.get("/szamlak/admin", authConfig);
    setAdminSzamlak(Array.isArray(response.data) ? response.data : []);
  }, [authConfig]);

  const fetchFizetesiModok = useCallback(async () => {
    const response = await httpCommon.get("/szamlak/payment-methods", authConfig);
    setFizetesiModok(Array.isArray(response.data) ? response.data : []);
  }, [authConfig]);

  useEffect(() => {
    const loadSajatSzamlak = async () => {
      if (!accessToken) {
        setSzamlak([]);
        setNyitottSzamlak({});
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await fetchSajatSzamlak();
      } catch (err) {
        setError("Nem sikerült a számlák betöltése. Kérjük, próbálkozz később.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSajatSzamlak();
  }, [accessToken, fetchSajatSzamlak]);

  useEffect(() => {
    const loadAdminAdatok = async () => {
      if (!accessToken || !isAdmin) {
        setAdminSzamlak([]);
        setFizetesiModok([]);
        setNyitottAdminSzamlak({});
        setAdminLoading(false);
        setAdminError(null);
        return;
      }

      setAdminLoading(true);
      setAdminError(null);

      try {
        await Promise.all([fetchAdminSzamlak(), fetchFizetesiModok()]);
      } catch (err) {
        setAdminError(extractError(err, "Nem sikerült betölteni az admin számlakezelési adatokat."));
        console.error(err);
      } finally {
        setAdminLoading(false);
      }
    };

    loadAdminAdatok();
  }, [accessToken, fetchAdminSzamlak, fetchFizetesiModok, isAdmin]);

  const toggleSzamla = (szamlaId) => {
    setNyitottSzamlak((prev) => ({ ...prev, [szamlaId]: !prev[szamlaId] }));
  };

  const toggleAdminSzamla = (szamlaId) => {
    setNyitottAdminSzamlak((prev) => ({ ...prev, [szamlaId]: !prev[szamlaId] }));
  };

  const handleCreateFizetesiMod = async (e) => {
    e.preventDefault();

    try {
      await httpCommon.post(
        "/szamlak/admin/payment-methods",
        { nev: ujFizetesiModNev.trim() },
        authConfig
      );
      setUjFizetesiModNev("");
      await fetchFizetesiModok();
      showMessage("success", "Új fizetési mód sikeresen létrehozva.");
    } catch (err) {
      showMessage("danger", extractError(err, "Hiba történt a fizetési mód mentése során."));
    }
  };

  const handleDeleteFizetesiMod = async (id, nev) => {
    if (!window.confirm(`Biztosan törölni szeretnéd a(z) ${nev} fizetési módot?`)) {
      return;
    }

    try {
      await httpCommon.delete(`/szamlak/admin/payment-methods/${id}`, authConfig);
      await fetchFizetesiModok();
      showMessage("success", `Fizetési mód törölve: ${nev}.`);
    } catch (err) {
      showMessage("danger", extractError(err, "Hiba történt a fizetési mód törlésekor."));
    }
  };

  const handleDeleteSzamla = async (id, szamlaszam) => {
    if (!window.confirm(`Biztosan törölni szeretnéd a(z) ${szamlaszam} számlát?`)) {
      return;
    }

    try {
      await httpCommon.delete(`/szamlak/admin/${id}`, authConfig);
      await Promise.all([fetchAdminSzamlak(), fetchSajatSzamlak()]);
      showMessage("success", `Számla törölve: ${szamlaszam}.`);
    } catch (err) {
      showMessage("danger", extractError(err, "Hiba történt a számla törlésekor."));
    }
  };

  if (!accessToken) {
    return (
      <Container className="py-5">
        <Alert variant="warning">A számlák megtekintéséhez be kell jelentkezned.</Alert>
      </Container>
    );
  }

  return (
    <Container className="szamlak-shell py-5 min-vh-100">
      <header className="szamlak-hero">
        <p className="szamlak-eyebrow">Számlák</p>
        <h1>Korábbi vásárlásaim és számláim</h1>
        <p className="szamlak-subtitle">
          Itt találod a saját számláidat.
        </p>
      </header>

      {uzenet.szoveg && (
        <Alert variant={uzenet.tipus} className="szamlak-alert">
          {uzenet.szoveg}
        </Alert>
      )}

      <section className="szamlak-card">
        <div className="szamlak-card-header">
          <h2>Saját számláim</h2>
          <p>A korábbi rendeléseidhez tartozó számlák és tételsorok.</p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="mb-0">
            {error}
          </Alert>
        ) : szamlak.length === 0 ? (
          <div className="szamlak-empty">
            <p className="text-muted mb-0">Még nincsenek rögzített számláid.</p>
          </div>
        ) : (
          <div className="szamlak-table-wrap">
            <Table hover responsive className="align-middle mb-0 szamlak-table">
              <thead>
                <tr>
                  <th style={{ width: 48 }} />
                  <th>Számlaszám</th>
                  <th>Dátum</th>
                  <th>Fizetési mód</th>
                  <th className="text-end">Végösszeg</th>
                  <th>Állapot</th>
                </tr>
              </thead>
              <tbody>
                {szamlak.map((szamla) => (
                  <React.Fragment key={szamla.id}>
                    <tr className="szamlak-row" onClick={() => toggleSzamla(szamla.id)}>
                      <td className="text-center">{nyitottSzamlak[szamla.id] ? "v" : ">"}</td>
                      <td className="fw-bold">{szamla.szamlaszam}</td>
                      <td>{formatDate(szamla.szamla_kelte)}</td>
                      <td>{szamla.fizetesi_mod_nev || `ID: ${szamla.fizetesi_mod}`}</td>
                      <td className="text-end">{formatCurrency(szamla.vegosszeg)}</td>
                      <td>
                        <Badge bg="success">Rögzítve</Badge>
                      </td>
                    </tr>

                    {nyitottSzamlak[szamla.id] && (
                      <tr>
                        <td colSpan="6" className="bg-light">
                          <div className="p-3">
                            <div className="small text-muted mb-2">
                              Teljesítés kelte: {formatDate(szamla.teljesites_kelte)} | Fizetési
                              határidő: {formatDate(szamla.fizetesi_hatarido)}
                            </div>
                            <Table size="sm" bordered className="mb-0 bg-white">
                              <thead>
                                <tr>
                                  <th>Ország</th>
                                  <th>Méret</th>
                                  <th>Anyag</th>
                                  <th className="text-end">Db</th>
                                  <th className="text-end">Egységár</th>
                                  <th className="text-end">Tétel összeg</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(szamla.tetelek || []).map((tetel, index) => (
                                  <tr
                                    key={`${tetel.szamla_id}-${tetel.zaszlo_id}-${tetel.meret}-${tetel.anyag}-${index}`}
                                  >
                                    <td>{tetel.orszag || "-"}</td>
                                    <td>{tetel.meret}</td>
                                    <td>{tetel.anyag}</td>
                                    <td className="text-end">{tetel.mennyiseg}</td>
                                    <td className="text-end">
                                      {formatCurrency(tetel.egyseg_ar)}
                                    </td>
                                    <td className="text-end">
                                      {formatCurrency(tetel.tetel_osszeg)}
                                    </td>
                                  </tr>
                                ))}
                                {!szamla.tetelek?.length && (
                                  <tr>
                                    <td colSpan="6" className="text-center text-muted py-3">
                                      Ehhez a számlához nem található tételsor.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </Table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </section>

      {isAdmin && (
        <>
          <section className="szamlak-card">
            <div className="szamlak-card-header">
              <h2>Admin számlakezelés</h2>
              <p>Az összes számla áttekintése, tételsorainak megnyitása és törlése.</p>
            </div>

            {adminLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : adminError ? (
              <Alert variant="danger" className="mb-0">
                {adminError}
              </Alert>
            ) : !adminSzamlak.length ? (
              <div className="szamlak-empty">
                <p className="text-muted mb-0">Nincs megjeleníthető számla.</p>
              </div>
            ) : (
              <div className="szamlak-table-wrap">
                <Table hover responsive className="align-middle mb-0 szamlak-table">
                  <thead>
                    <tr>
                      <th style={{ width: 48 }} />
                      <th>Számlaszám</th>
                      <th>Vásárló</th>
                      <th>Dátum</th>
                      <th>Fizetési mód</th>
                      <th className="text-end">Végösszeg</th>
                      <th className="text-end">Művelet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminSzamlak.map((szamla) => (
                      <React.Fragment key={szamla.id}>
                        <tr className="szamlak-row" onClick={() => toggleAdminSzamla(szamla.id)}>
                          <td className="text-center">
                            {nyitottAdminSzamlak[szamla.id] ? "v" : ">"}
                          </td>
                          <td className="fw-semibold">{szamla.szamlaszam}</td>
                          <td>
                            <div>{szamla.vevo_nev || "-"}</div>
                            <small className="text-muted">{szamla.vevo_email || "-"}</small>
                          </td>
                          <td>{formatDate(szamla.szamla_kelte)}</td>
                          <td>{szamla.fizetesi_mod_nev || `ID: ${szamla.fizetesi_mod}`}</td>
                          <td className="text-end">{formatCurrency(szamla.vegosszeg)}</td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSzamla(szamla.id, szamla.szamlaszam);
                              }}
                            >
                              Törlés
                            </button>
                          </td>
                        </tr>

                        {nyitottAdminSzamlak[szamla.id] && (
                          <tr>
                            <td colSpan="7" className="bg-light">
                              <div className="p-3">
                                <div className="small text-muted mb-2">
                                  Vevő azonosító: #{szamla.vevo_id} | Teljesítés:{" "}
                                  {formatDate(szamla.teljesites_kelte)}
                                </div>
                                <Table size="sm" bordered className="mb-0 bg-white">
                                  <thead>
                                    <tr>
                                      <th>Ország</th>
                                      <th>Méret</th>
                                      <th>Anyag</th>
                                      <th className="text-end">Db</th>
                                      <th className="text-end">Egységár</th>
                                      <th className="text-end">Tétel összeg</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(szamla.tetelek || []).map((item, index) => (
                                      <tr
                                        key={`${item.szamla_id}-${item.zaszlo_id}-${item.meret}-${item.anyag}-${index}`}
                                      >
                                        <td>{item.orszag || "-"}</td>
                                        <td>{item.meret}</td>
                                        <td>{item.anyag}</td>
                                        <td className="text-end">{item.mennyiseg}</td>
                                        <td className="text-end">
                                          {formatCurrency(item.egyseg_ar)}
                                        </td>
                                        <td className="text-end">
                                          {formatCurrency(item.tetel_osszeg)}
                                        </td>
                                      </tr>
                                    ))}
                                    {!szamla.tetelek?.length && (
                                      <tr>
                                        <td colSpan="6" className="text-center text-muted py-3">
                                          A számlához nem található tételsor.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </Table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </section>

          <section className="szamlak-card">
            <div className="szamlak-card-header">
              <h2>Fizetési módok kezelése</h2>
              <p>Új fizetési mód felvétele és a már meglévők törlése admin jogosultsággal.</p>
            </div>

            <div className="row g-4 align-items-start">
              <div className="col-lg-4">
                <form onSubmit={handleCreateFizetesiMod} className="szamlak-form">
                  <label className="form-label fw-semibold">Új fizetési mód neve</label>
                  <input
                    type="text"
                    className="form-control"
                    value={ujFizetesiModNev}
                    onChange={(e) => setUjFizetesiModNev(e.target.value)}
                    placeholder="pl. Bankkártya"
                    required
                  />
                  <button type="submit" className="btn btn-primary">
                    Új mód létrehozása
                  </button>
                </form>
              </div>

              <div className="col-lg-8">
                <div className="szamlak-table-wrap">
                  <Table responsive className="align-middle mb-0 szamlak-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Megnevezés</th>
                        <th className="text-end">Művelet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fizetesiModok.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.nev}</td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDeleteFizetesiMod(item.id, item.nev)}
                            >
                              Törlés
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!fizetesiModok.length && (
                        <tr>
                          <td colSpan="3" className="text-center text-muted py-3">
                            Nincs megjeleníthető fizetési mód.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </Container>
  );
};

export default Szamlak;
