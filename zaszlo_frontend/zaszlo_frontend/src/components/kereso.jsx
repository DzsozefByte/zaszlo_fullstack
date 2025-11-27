import React, { useState, useEffect, useCallback } from "react";
import httpCommon from "../http-common";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Pagination from 'react-bootstrap/Pagination';
import { useLocation, useNavigate } from 'react-router-dom';

const Kereso = () => {
    const [zaszlok, setZaszlok] = useState([]);
    const [filters, setFilters] = useState({
        continent: "",
        search: ""
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
            setZaszlok(response.data);
            setCurrentPage(1);
        } catch (error) {
            console.error("Hiba az adatok lekérése során:", error);
        }
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const newFilters = { continent: params.get("continent") || "" };

        setFilters(prev => {
            const updated = { ...prev, ...newFilters };
            fetchData(updated);
            return updated;
        });
    }, [location.search, fetchData]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => {
            const updated = { ...prev, [name]: value };
            fetchData(updated);
            return updated;
        });
    };

    const uniqueCountries = Array.from(
        new Map(zaszlok.map(z => [z.orszag, z])).values()
    );

    const totalPages = Math.ceil(uniqueCountries.length / itemsPerPage);
    const firstIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = uniqueCountries.slice(firstIndex, firstIndex + itemsPerPage);

    const changePage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="kereso-page-wrapper d-flex flex-column min-vh-100">

            <div className="content-area d-flex flex-wrap">

                <div className="filter-panel mb-3">
                    <h4>Szűrők</h4>

                    <label className="form-label">Kontinens</label>
                    <select
                        className="form-select mb-3"
                        name="continent"
                        value={filters.continent}
                        onChange={handleFilterChange}
                    >
                        <option value="">Összes</option>
                        <option value="Európa">Európa</option>
                        <option value="Amerika">Amerika</option>
                        <option value="Ázsia">Ázsia</option>
                        <option value="Afrika">Afrika</option>
                        <option value="Óceánia">Óceánia</option>
                    </select>

                    <label className="form-label">Keresés</label>
                    <input
                        type="text"
                        className="form-control"
                        name="search"
                        placeholder="Ország..."
                        value={filters.search}
                        onChange={handleFilterChange}
                    />
                </div>

                <div className="flags-main-content flex-grow-1">

                    <div className="flags-grid">
                        {currentItems.map((z, index) => (
                            <Card key={index} className="flag-card">
                                <div className="flag-img-wrapper">
                                    <Card.Img
                                        variant="top"
                                        src={`/images/${z.id}.png`}
                                        className="flag-img"
                                    />
                                </div>
                                <Card.Body>
                                    <Card.Title className="flag-title">{z.orszag}</Card.Title>
                                    <Button
                                        variant="primary"
                                        style={{ width: '100%' }}
                                        onClick={() => navigate(`/termek/${encodeURIComponent(z.orszag)}`)}
                                    >
                                        Részletek
                                    </Button>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-wrapper mt-4">
                            <Pagination className="justify-content-center">
                                <Pagination.First onClick={() => changePage(1)} />
                                <Pagination.Prev onClick={() => changePage(currentPage - 1)} />

                                {Array.from({ length: totalPages }, (_, i) => (
                                    <Pagination.Item
                                        key={i + 1}
                                        active={i + 1 === currentPage}
                                        onClick={() => changePage(i + 1)}
                                    >
                                        {i + 1}
                                    </Pagination.Item>
                                ))}

                                <Pagination.Next onClick={() => changePage(currentPage + 1)} />
                                <Pagination.Last onClick={() => changePage(totalPages)} />
                            </Pagination>
                        </div>
                    )}

                </div>

            </div>

        </div>
    );
};

export default Kereso;
