import React, { useState, useEffect, useCallback } from "react";
import httpCommon from "../http-common";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Pagination from "react-bootstrap/Pagination";
import Form from "react-bootstrap/Form";
import { useLocation, useNavigate } from "react-router-dom";
import { IoMdSearch, IoMdFunnel } from "react-icons/io";

/* ------------------ NEMZETKÖZI LISTÁK ------------------ */

const EU_COUNTRIES = [
  "Ausztria","Belgium","Bulgária","Ciprus","Csehország","Dánia",
  "Észtország","Finnország","Franciaország","Görögország",
  "Hollandia","Horvátország","Írország","Lengyelország",
  "Lettország","Litvánia","Luxemburg","Magyarország","Málta",
  "Németország","Olaszország","Portugália","Románia",
  "Spanyolország","Svédország","Szlovákia","Szlovénia"
];

const NATO_COUNTRIES = [
  "Albánia","Belgium","Bulgária","Csehország","Dánia",
  "Észtország","Finnország","Franciaország","Görögország",
  "Hollandia","Horvátország","Izland","Kanada","Lengyelország",
  "Lettország","Litvánia","Luxemburg","Magyarország",
  "Montenegró","Németország","Norvégia","Olaszország",
  "Portugália","Románia","Spanyolország","Svédország",
  "Szlovákia","Szlovénia","Törökország","Egyesült Államok",
    "Egyesült Királyság"
];

const SCHENGEN_COUNTRIES = [
  "Ausztria","Belgium","Csehország","Dánia","Észtország",
  "Finnország","Franciaország","Görögország","Hollandia",
  "Horvátország","Izland","Lengyelország","Lettország",
  "Litvánia","Luxemburg","Magyarország","Málta",
  "Németország","Norvégia","Olaszország","Portugália",
  "Spanyolország","Svédország","Szlovákia","Szlovénia"
];

/* ------------------ KOMPONENS ------------------ */

const Kereso = () => {
  const [zaszlok, setZaszlok] = useState([]);
  const [filters, setFilters] = useState({
    continent: "",
    search: "",
    eu: false,
    nato: false,
    schengen: false
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  const location = useLocation();
  const navigate = useNavigate();

  const fetchData = useCallback(async (filt) => {
    try {
      const p = new URLSearchParams();
      if (filt.continent) p.append("kontinens", filt.continent);
      if (filt.search) p.append("orszag", filt.search);

      const queryString = p.toString();
      const url = queryString ? `/zaszlok/search?${queryString}` : "/zaszlok";

      const response = await httpCommon.get(url);
      let data = Array.isArray(response.data)
        ? response.data
        : [response.data];

      if (filt.search) {
        const exactMatches = data.filter(
          z =>
            z.orszag.trim().toLowerCase() ===
            filt.search.trim().toLowerCase()
        );
        if (exactMatches.length) data = exactMatches;
      }

      /* -------- FRONTEND EXTRA SZŰRÉS -------- */

      if (filt.eu) {
        data = data.filter(z => EU_COUNTRIES.includes(z.orszag));
      }

      if (filt.nato) {
        data = data.filter(z => NATO_COUNTRIES.includes(z.orszag));
      }

      if (filt.schengen) {
        data = data.filter(z => SCHENGEN_COUNTRIES.includes(z.orszag));
      }

      setZaszlok(data);
      setCurrentPage(1);

    } catch (error) {
      console.error("Hiba az adatok lekérése során:", error);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = {
      continent: params.get("continent") || "",
      search: params.get("search") || "",
      eu: false,
      nato: false,
      schengen: false
    };
    setFilters(newFilters);
    fetchData(newFilters);
  }, [location.search, fetchData]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;

    const updated = {
      ...filters,
      [name]: type === "checkbox" ? checked : value
    };

    setFilters(updated);
    fetchData(updated);
  };

  const uniqueCountries = Array.from(
    new Map(zaszlok.map(z => [z.orszag, z])).values()
  );

  const totalPages = Math.ceil(uniqueCountries.length / itemsPerPage);
  const firstIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = uniqueCountries.slice(
    firstIndex,
    firstIndex + itemsPerPage
  );

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetFilters = () => {
    const cleared = {
      continent: "",
      search: "",
      eu: false,
      nato: false,
      schengen: false
    };
    setFilters(cleared);
    fetchData(cleared);
    navigate("/kereso");
  };

  return (
    <div
      className="kereso-page-wrapper"
      style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      <div className="container py-5">
        <div className="row">

          {/* SIDEBAR */}
          <div className="col-lg-3 mb-4">
            <div
              className="filter-card shadow-sm p-4 bg-white rounded-3 sticky-top"
              style={{ top: "100px", zIndex: 900 }}
            >
              <div className="d-flex align-items-center mb-4 text-primary">
                <IoMdFunnel size={24} className="me-2" />
                <h4 className="m-0 fw-bold">Szűrés</h4>
              </div>

              {/* KERESÉS */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted small text-uppercase">
                  Keresés
                </Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <IoMdSearch />
                  </span>
                  <Form.Control
                    type="text"
                    name="search"
                    placeholder="Ország neve..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="border-start-0 bg-light"
                  />
                </div>
              </Form.Group>

              {/* KONTINENS */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted small text-uppercase">
                  Kontinens
                </Form.Label>
                <Form.Select
                  name="continent"
                  value={filters.continent}
                  onChange={handleFilterChange}
                  className="bg-light"
                >
                  <option value="">Mindegyik</option>
                  <option value="Európa">Európa</option>
                  <option value="Amerika">Amerika</option>
                  <option value="Ázsia">Ázsia</option>
                  <option value="Afrika">Afrika</option>
                  <option value="Óceánia">Óceánia</option>
                </Form.Select>
              </Form.Group>

              {/* TAGSÁG */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted small text-uppercase">
                  Nemzetközi tagság
                </Form.Label>

                <Form.Check
                  type="checkbox"
                  label="EU tagállam"
                  name="eu"
                  checked={filters.eu}
                  onChange={handleFilterChange}
                  className="mb-2"
                />

                <Form.Check
                  type="checkbox"
                  label="NATO tag"
                  name="nato"
                  checked={filters.nato}
                  onChange={handleFilterChange}
                  className="mb-2"
                />

                <Form.Check
                  type="checkbox"
                  label="Schengen tag"
                  name="schengen"
                  checked={filters.schengen}
                  onChange={handleFilterChange}
                />
              </Form.Group>

              <div className="text-muted small mt-4">
                Találatok száma: <strong>{uniqueCountries.length}</strong> db
              </div>

              <Button
                variant="outline-secondary"
                className="w-100 mt-3"
                onClick={resetFilters}
              >
                Szűrők törlése
              </Button>
            </div>
          </div>

          {/* EREDMÉNYEK */}
          <div className="col-lg-9">
            {currentItems.length === 0 ? (
              <div className="text-center py-5">
                <h3 className="text-muted">
                  Nincs találat a keresési feltételekre.
                </h3>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                {currentItems.map((z, index) => (
                  <div className="col" key={index}>
                    <Card
                      className="h-100 border-0 shadow-sm flag-card-hover"
                      style={{
                        borderRadius: "15px",
                        cursor: "pointer",
                        transition: "transform 0.3s"
                      }}
                      onClick={() =>
                        navigate(`/termek/${encodeURIComponent(z.orszag)}`)
                      }
                    >
                      <div
                        className="p-4 d-flex align-items-center justify-content-center bg-light"
                        style={{
                          borderRadius: "15px 15px 0 0",
                          height: "180px"
                        }}
                      >
                        <Card.Img
                          variant="top"
                          src={`/images/${z.id}.png`}
                          style={{
                            maxHeight: "100%",
                            maxWidth: "100%",
                            objectFit: "contain",
                            filter:
                              "drop-shadow(0 5px 5px rgba(0,0,0,0.1))"
                          }}
                        />
                      </div>
                      <Card.Body className="text-center">
                        <Card.Title className="fw-bold mb-3">
                          {z.orszag}
                        </Card.Title>
                        <Button
                          variant="outline-primary"
                          className="w-100 rounded-pill fw-semibold"
                        >
                          Részletek
                        </Button>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination>
                  <Pagination.Prev
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => changePage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .flag-card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default Kereso;