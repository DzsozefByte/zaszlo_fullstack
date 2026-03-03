import React, { useEffect, useState } from "react";
import { Alert, Badge, Container, Spinner, Table } from "react-bootstrap";
import httpCommon from "../http-common";

const Szamlak = ({ accessToken }) => {
  const [szamlak, setSzamlak] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nyitottSzamlak, setNyitottSzamlak] = useState({});

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString("hu-HU") : "-";

  const formatCurrency = (value) => `${Number(value || 0).toLocaleString("hu-HU")} Ft`;

  useEffect(() => {
    const fetchSzamlak = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await httpCommon.get("/szamlak", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setSzamlak(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError("Nem sikerult a szamlak betoltese. Kerjuk, probalkozz kesobb!");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSzamlak();
  }, [accessToken]);

  const toggleSzamla = (szamlaId) => {
    setNyitottSzamlak((prev) => ({ ...prev, [szamlaId]: !prev[szamlaId] }));
  };

  if (!accessToken) {
    return (
      <Container className="py-5">
        <Alert variant="warning">A szamlak megtekintesehez be kell jelentkezned!</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5 min-vh-100">
      <h2 className="mb-4 fw-bold">Korabbi vasarlasaim es szamlaim</h2>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : szamlak.length === 0 ? (
        <div className="text-center py-5 bg-light rounded">
          <p className="text-muted mb-0">Meg nincsenek rogzitett szamlaid.</p>
        </div>
      ) : (
        <div className="shadow-sm rounded bg-white p-3">
          <Table hover responsive className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 48 }} />
                <th>Szamlaszam</th>
                <th>Datum</th>
                <th>Fizetesi mod</th>
                <th className="text-end">Vegosszeg</th>
                <th>Allapot</th>
              </tr>
            </thead>
            <tbody>
              {szamlak.map((szamla) => (
                <React.Fragment key={szamla.id}>
                  <tr style={{ cursor: "pointer" }} onClick={() => toggleSzamla(szamla.id)}>
                    <td className="text-center">{nyitottSzamlak[szamla.id] ? "v" : ">"}</td>
                    <td className="fw-bold">{szamla.szamlaszam}</td>
                    <td>{formatDate(szamla.szamla_kelte)}</td>
                    <td>{szamla.fizetesi_mod_nev || `ID: ${szamla.fizetesi_mod}`}</td>
                    <td className="text-end">{formatCurrency(szamla.vegosszeg)}</td>
                    <td>
                      <Badge bg="success">Rogzitve</Badge>
                    </td>
                  </tr>

                  {nyitottSzamlak[szamla.id] && (
                    <tr>
                      <td colSpan="6" className="bg-light">
                        <div className="p-2">
                          <div className="small text-muted mb-2">
                            Teljesites kelte: {formatDate(szamla.teljesites_kelte)} | Fizetesi hatarido: {" "}
                            {formatDate(szamla.fizetesi_hatarido)}
                          </div>
                          <Table size="sm" bordered className="mb-0 bg-white">
                            <thead>
                              <tr>
                                <th>Orszag</th>
                                <th>Meret</th>
                                <th>Anyag</th>
                                <th className="text-end">Db</th>
                                <th className="text-end">Egysegar</th>
                                <th className="text-end">Tetel osszeg</th>
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
                                  <td className="text-end">{formatCurrency(tetel.egyseg_ar)}</td>
                                  <td className="text-end">{formatCurrency(tetel.tetel_osszeg)}</td>
                                </tr>
                              ))}
                              {!szamla.tetelek?.length && (
                                <tr>
                                  <td colSpan="6" className="text-center text-muted py-3">
                                    Ehhez a szamlahoz nem talalhato tetelsor.
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
    </Container>
  );
};

export default Szamlak;
