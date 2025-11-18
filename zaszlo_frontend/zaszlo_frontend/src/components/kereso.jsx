import React, { useState, useEffect, useCallback } from "react";
import httpCommon from "../http-common";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { useLocation } from 'react-router-dom';

const Kereso = () => {
    const [zaszlok, setZaszlok] = useState([]);
    const [filters, setFilters] = useState({
        continent: "",
        size: "",
        material: "",
        search: ""
    });

    const location = useLocation();

    const fetchData = useCallback(async (filt) => {
        try {
            const p = new URLSearchParams();
            if (filt.continent) p.append("kontinens", filt.continent);
            if (filt.size) p.append("meret", filt.size);
            if (filt.material) p.append("anyag", filt.material);
            if (filt.search) p.append("orszag", filt.search);

            const queryString = p.toString();
            const url = queryString ? `/zaszlok/search?${queryString}` : "/zaszlok";

            const response = await httpCommon.get(url);
            setZaszlok(response.data);
        } catch (error) {
            console.error("Hiba az adatok lekérése során:", error);
        }
    }, []);

    // --- URL paraméterekből olvassuk a szűrőket (kivéve a search-t) ---
    useEffect(() => {
        const params = new URLSearchParams(location.search);

        const newFilters = {
            continent: params.get("continent") || "",
            size: params.get("size") || "",
            material: params.get("material") || "",
        };

        setFilters(prev => {
            const updated = { ...prev, ...newFilters };
            fetchData(updated); // az URL paraméterek szerinti szűrés
            return updated;
        });
    }, [location.search, fetchData]);

    // --- Handle változtatások a szűrőkön (select + search) ---
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => {
            const updated = { ...prev, [name]: value };
            fetchData(updated); // azonnali szűrés
            return updated;
        });
    };

    const uniqueFlags = Array.from(new Map(zaszlok.map(z => [z.orszag, z])).values());

    return (
        <div className="kereso-container">

            {/* Bal panel */}
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

                <label className="form-label">Méret (cm)</label>
                <select className="form-select mb-3" name="size" value={filters.size} onChange={handleFilterChange}>
                    <option value="">Összes</option>
                    <option value="60x40">60x40</option>
                    <option value="90x60">90x60</option>
                    <option value="150x90">150x90</option>
                    <option value="200x100">200x100</option>
                    <option value="300x150">300x150</option>
                </select>

                <label className="form-label">Anyag</label>
                <select className="form-select mb-3" name="material" value={filters.material} onChange={handleFilterChange}>
                    <option value="">Összes</option>
                    <option value="Poliészter">Poliészter</option>
                    <option value="Selyem">Selyem</option>
                    <option value="Nylon">Nylon</option>
                    <option value="rPET">rPET</option>
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

            {/* Grid */}
            <div className="flags-grid">
                {uniqueFlags.map((z, index) => (
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

                            <div className="flag-info">
                                Méret: {z.meret} | Anyag: {z.anyag}
                            </div>

                            <Button variant="primary" style={{ width: '100%' }}>Részletek</Button>
                        </Card.Body>
                    </Card>
                ))}
            </div>

        </div>
    );
};

export default Kereso;
