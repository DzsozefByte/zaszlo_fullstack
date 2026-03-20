import React, { useEffect, useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Pagination from "react-bootstrap/Pagination";
import { IoMdFunnel, IoMdSearch } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import httpCommon from "../http-common";

const normalizeText = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const EU_COUNTRIES = new Set(
  [
    "Ausztria",
    "Belgium",
    "Bulgária",
    "Ciprus",
    "Csehország",
    "Dánia",
    "Észtország",
    "Finnország",
    "Franciaország",
    "Görögország",
    "Hollandia",
    "Horvátország",
    "Írország",
    "Lengyelország",
    "Lettország",
    "Litvánia",
    "Luxemburg",
    "Magyarország",
    "Málta",
    "Németország",
    "Olaszország",
    "Portugália",
    "Románia",
    "Spanyolország",
    "Svédország",
    "Szlovákia",
    "Szlovénia",
  ].map(normalizeText)
);

const NATO_COUNTRIES = new Set(
  [
    "Albánia",
    "Belgium",
    "Bulgária",
    "Csehország",
    "Dánia",
    "Észtország",
    "Finnország",
    "Franciaország",
    "Görögország",
    "Hollandia",
    "Horvátország",
    "Izland",
    "Kanada",
    "Lengyelország",
    "Lettország",
    "Litvánia",
    "Luxemburg",
    "Magyarország",
    "Montenegró",
    "Németország",
    "Norvégia",
    "Olaszország",
    "Portugália",
    "Románia",
    "Spanyolország",
    "Svédország",
    "Szlovákia",
    "Szlovénia",
    "Törökország",
    "Egyesült Államok",
    "Egyesült Királyság",
  ].map(normalizeText)
);

const SCHENGEN_COUNTRIES = new Set(
  [
    "Ausztria",
    "Belgium",
    "Csehország",
    "Dánia",
    "Észtország",
    "Finnország",
    "Franciaország",
    "Görögország",
    "Hollandia",
    "Horvátország",
    "Izland",
    "Lengyelország",
    "Lettország",
    "Litvánia",
    "Luxemburg",
    "Magyarország",
    "Málta",
    "Németország",
    "Norvégia",
    "Olaszország",
    "Portugália",
    "Spanyolország",
    "Svédország",
    "Szlovákia",
    "Szlovénia",
  ].map(normalizeText)
);

const getBaseFiltersFromSearch = (searchString) => {
  const params = new URLSearchParams(searchString);

  return {
    continent: params.get("continent") || "",
    search: params.get("search") || "",
  };
};

const matchesMembershipFilters = (countryName, membershipFilters) => {
  const normalizedCountry = normalizeText(countryName);

  if (membershipFilters.eu && !EU_COUNTRIES.has(normalizedCountry)) {
    return false;
  }

  if (membershipFilters.nato && !NATO_COUNTRIES.has(normalizedCountry)) {
    return false;
  }

  if (membershipFilters.schengen && !SCHENGEN_COUNTRIES.has(normalizedCountry)) {
    return false;
  }

  return true;
};

const Kereso = () => {
  const [zaszlok, setZaszlok] = useState([]);
  const [membershipFilters, setMembershipFilters] = useState({
    eu: false,
    nato: false,
    schengen: false,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 18;
  const location = useLocation();
  const navigate = useNavigate();

  const baseFilters = useMemo(() => getBaseFiltersFromSearch(location.search), [location.search]);

  const filters = useMemo(
    () => ({
      ...baseFilters,
      ...membershipFilters,
    }),
    [baseFilters, membershipFilters]
  );

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.continent) {
          params.append("kontinens", filters.continent);
        }
        if (filters.search) {
          params.append("orszag", filters.search);
        }

        const queryString = params.toString();
        const url = queryString ? `/zaszlok/search?${queryString}` : "/zaszlok";
        const response = await httpCommon.get(url);

        let data = Array.isArray(response.data) ? response.data : [response.data];
        const normalizedSearch = normalizeText(filters.search);

        if (normalizedSearch) {
          const exactMatches = data.filter(
            (item) => normalizeText(item.orszag) === normalizedSearch
          );

          if (exactMatches.length) {
            data = exactMatches;
          }
        }

        data = data.filter((item) => matchesMembershipFilters(item.orszag, membershipFilters));

        if (!isMounted) {
          return;
        }

        setZaszlok(data);
        setCurrentPage(1);
      } catch (error) {
        if (isMounted) {
          console.error("Hiba az adatok lekerese soran:", error);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [filters, membershipFilters]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setMembershipFilters((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    const nextParams = new URLSearchParams(location.search);
    if (value) {
      nextParams.set(name, value);
    } else {
      nextParams.delete(name);
    }

    const nextSearch = nextParams.toString();
    navigate(
      {
        pathname: "/kereso",
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true }
    );
  };

  const uniqueCountries = Array.from(new Map(zaszlok.map((item) => [item.orszag, item])).values());
  const totalPages = Math.ceil(uniqueCountries.length / itemsPerPage);
  const firstIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = uniqueCountries.slice(firstIndex, firstIndex + itemsPerPage);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetFilters = () => {
    setMembershipFilters({
      eu: false,
      nato: false,
      schengen: false,
    });
    navigate("/kereso", { replace: true });
  };

  return (
    <div
      className="kereso-page-wrapper"
      style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-3 mb-4">
            <div
              className="filter-card shadow-sm p-4 bg-white rounded-3 sticky-top"
              style={{ top: "100px", zIndex: 900 }}
            >
              <div className="d-flex align-items-center mb-4 text-primary">
                <IoMdFunnel size={24} className="me-2" />
                <h4 className="m-0 fw-bold">Szures</h4>
              </div>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted small text-uppercase">
                  Kereses
                </Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <IoMdSearch />
                  </span>
                  <Form.Control
                    type="text"
                    name="search"
                    placeholder="Orszag neve..."
                    value={baseFilters.search}
                    onChange={handleFilterChange}
                    className="border-start-0 bg-light"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted small text-uppercase">
                  Kontinens
                </Form.Label>
                <Form.Select
                  name="continent"
                  value={baseFilters.continent}
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

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted small text-uppercase">
                  Nemzetkozi tagsag
                </Form.Label>

                <Form.Check
                  type="checkbox"
                  label="EU tagallam"
                  name="eu"
                  checked={membershipFilters.eu}
                  onChange={handleFilterChange}
                  className="mb-2"
                />

                <Form.Check
                  type="checkbox"
                  label="NATO tag"
                  name="nato"
                  checked={membershipFilters.nato}
                  onChange={handleFilterChange}
                  className="mb-2"
                />

                <Form.Check
                  type="checkbox"
                  label="Schengen tag"
                  name="schengen"
                  checked={membershipFilters.schengen}
                  onChange={handleFilterChange}
                />
              </Form.Group>

              <div className="text-muted small mt-4">
                Talalatok szama: <strong>{uniqueCountries.length}</strong> db
              </div>

              <Button
                variant="outline-secondary"
                className="w-100 mt-3"
                onClick={resetFilters}
              >
                Szurok torlese
              </Button>
            </div>
          </div>

          <div className="col-lg-9">
            {currentItems.length === 0 ? (
              <div className="text-center py-5">
                <h3 className="text-muted">
                  Nincs talalat a keresesi feltetelekre.
                </h3>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                {currentItems.map((item) => (
                  <div className="col" key={`${item.orszag}-${item.id}`}>
                    <Card
                      className="h-100 border-0 shadow-sm flag-card-hover"
                      style={{
                        borderRadius: "15px",
                        cursor: "pointer",
                        transition: "transform 0.3s",
                      }}
                      onClick={() =>
                        navigate(`/termek/${encodeURIComponent(item.orszag)}`)
                      }
                    >
                      <div
                        className="p-4 d-flex align-items-center justify-content-center bg-light"
                        style={{
                          borderRadius: "15px 15px 0 0",
                          height: "180px",
                        }}
                      >
                        <Card.Img
                          variant="top"
                          src={`/images/${item.id}.png`}
                          style={{
                            maxHeight: "100%",
                            maxWidth: "100%",
                            objectFit: "contain",
                            filter: "drop-shadow(0 5px 5px rgba(0,0,0,0.1))",
                          }}
                        />
                      </div>
                      <Card.Body className="text-center">
                        <Card.Title className="fw-bold mb-3">
                          {item.orszag}
                        </Card.Title>
                        <Button
                          variant="outline-primary"
                          className="w-100 rounded-pill fw-semibold"
                        >
                          Reszletek
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
                  {[...Array(totalPages)].map((_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={index + 1 === currentPage}
                      onClick={() => changePage(index + 1)}
                    >
                      {index + 1}
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
