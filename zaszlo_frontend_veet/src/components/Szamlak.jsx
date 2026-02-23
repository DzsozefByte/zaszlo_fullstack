import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import httpCommon from '../http-common';

const Szamlak = ({ accessToken }) => {
    const [szamlak, setSzamlak] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSzamlak = async () => {
            if (!accessToken) return;
            
            try {
                // A httpCommon már tartalmazza az alap URL-t
                const response = await httpCommon.get('/szamlak', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                setSzamlak(response.data);
            } catch (err) {
                setError("Nem sikerült a számlák betöltése. Kérjük, próbálkozz később!");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSzamlak();
    }, [accessToken]);

    if (!accessToken) {
        return (
            <Container className="py-5">
                <Alert variant="warning">A számlák megtekintéséhez be kell jelentkezned!</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-5 min-vh-100">
            <h2 className="mb-4 fw-bold">Korábbi vásárlásaim</h2>
            
            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : szamlak.length === 0 ? (
                <div className="text-center py-5 bg-light rounded">
                    <p className="text-muted mb-0">Még nincsenek rögzített számláid.</p>
                </div>
            ) : (
                <div className="shadow-sm rounded bg-white p-3">
                    <Table hover responsive>
                        <thead className="table-light">
                            <tr>
                                <th>Számlaszám</th>
                                <th>Dátum</th>
                                <th>Fizetési mód</th>
                                <th>Állapot</th>
                            </tr>
                        </thead>
                        <tbody>
                            {szamlak.map(s => (
                                <tr key={s.id}>
                                    <td className="fw-bold">{s.szamlaszam}</td>
                                    <td>{new Date(s.szamla_kelte).toLocaleDateString('hu-HU')}</td>
                                    <td>{s.fizetesi_mod === 2 ? 'Bankkártya' : 'Készpénz / Utánvét'}</td>
                                    <td><Badge bg="success">Teljesítve</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </Container>
    );
};

export default Szamlak;