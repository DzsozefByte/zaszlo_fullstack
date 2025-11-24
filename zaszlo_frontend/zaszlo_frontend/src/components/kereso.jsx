import React, { useState, useEffect, useCallback } from "react";
import httpCommon from "../http-common";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { useLocation, useNavigate } from 'react-router-dom';

const Kereso = () => {
    const [zaszlok, setZaszlok] = useState([]);
    const [filters, setFilters] = useState({
        continent: "",
        search: ""
    });

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
        } catch (error) {
            console.error("Hiba az adatok lekérése során:", error);
        }
    }, []);

    // URL paraméterekből kontinens szűrő
    useEffect(() => {
        const params = new URLSearchParams(location.search);

        const newFilters = {
            continent: params.get("continent") || ""
        };

        setFilters(prev => {
            const updated = { ...prev, ...newFilters };
            fetchData(updated);
            return updated;
        });
    }, [location.search, fetchData]);

    // kereső mező kezelése
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => {
            const updated = { ...prev, [name]: value };
            fetchData(updated);
            return updated;
        });
    };

    // ---- Egyedi országlista ----
    const uniqueCountries = Array.from(
        new Map(zaszlok.map(z => [z.orszag, z])).values()
    );

    return (
        <div className="kereso-container">

            {/* Bal panel – már csak kontinens + keresés marad */}
            <div className="filter-panel">
                <h4>Szűrők</h4>

                <label className="form-label">Kontinens</label>
                <select className="form-select mb-3" name="continent" value={filters.continent} onChange={handleFilterChange}>
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

            {/* Kártyarács */}
            <div className="flags-grid">
                {uniqueCountries.map((z, index) => (
                    <Card key={index} className="flag-card">
                        <div className="flag-img-wrapper">
                            <Card.Img
                                variant="top"
                                src={`/images/${z.id}.png`}
                                className="flag-img"
                            />
                        </div>

                        <Card.Body style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
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

        </div>
    );
};

export default Kereso;