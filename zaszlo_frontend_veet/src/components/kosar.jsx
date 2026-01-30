import React, { useContext } from "react";
import { KosarContext } from "../context/KosarContext";
import { Button, Card, Table, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { IoMdTrash, IoMdAdd, IoMdRemove, IoMdCart } from "react-icons/io";

const Kosar = () => {
    const { kosar, torlesKosarbol, dbModositas, vegosszeg } = useContext(KosarContext);
    const navigate = useNavigate();

    if (kosar.length === 0) {
        return (
            <Container className="py-5 mt-5 text-center">
                <div className="mb-4">
                    <IoMdCart size={80} className="text-light" />
                </div>
                <h2 className="fw-bold">A kosarad jelenleg üres</h2>
                <p className="text-muted">Nézz szét a kínálatunkban és válaszd ki kedvenc zászlóidat!</p>
                <Button variant="primary" size="lg" className="mt-3 rounded-pill px-5 shadow-sm" onClick={() => navigate("/")}>
                    Vásárlás megkezdése
                </Button>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4 fw-bold d-flex align-items-center gap-2">
                <IoMdCart /> Kosár tartalma
            </h2>
            
            <Row className="g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <Table responsive hover className="align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 px-4 py-3">Termék</th>
                                    <th className="border-0 py-3">Részletek</th>
                                    <th className="border-0 py-3 text-center">Mennyiség</th>
                                    <th className="border-0 py-3">Összesen</th>
                                    <th className="border-0 py-3 text-end px-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {kosar.map((item) => (
                                    <tr key={`${item.id}-${item.meret}-${item.anyag}`}>
                                        <td className="px-4 py-3" style={{ width: "120px" }}>
                                            <img 
                                                src={item.kep} 
                                                alt={item.orszag} 
                                                className="shadow-sm"
                                                style={{ width: "80px", height: "auto", borderRadius: "8px", objectFit: "cover" }} 
                                            />
                                        </td>
                                        <td className="py-3">
                                            <div className="fw-bold text-dark">{item.orszag}</div>
                                            <div className="text-muted small">{item.meret} | {item.anyag}</div>
                                            <div className="text-primary fw-medium d-lg-none">{item.ar.toLocaleString()} Ft</div>
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex align-items-center justify-content-center border rounded-pill py-1 px-2 mx-auto" style={{ width: "fit-content" }}>
                                                <button className="btn btn-link btn-sm text-dark p-0" onClick={() => dbModositas(item.id, item.meret, item.anyag, -1)}><IoMdRemove /></button>
                                                <span className="mx-3 fw-bold">{item.db}</span>
                                                <button className="btn btn-link btn-sm text-dark p-0" onClick={() => dbModositas(item.id, item.meret, item.anyag, 1)}><IoMdAdd /></button>
                                            </div>
                                        </td>
                                        <td className="py-3 fw-bold text-dark">
                                            {(item.ar * item.db).toLocaleString()} Ft
                                        </td>
                                        <td className="py-3 text-end px-4">
                                            <button 
                                                className="btn btn-outline-danger btn-sm rounded-circle border-0" 
                                                onClick={() => torlesKosarbol(item.id, item.meret, item.anyag)}
                                            >
                                                <IoMdTrash size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>

                <div className="col-lg-4">
                    <Card className="border-0 shadow-sm rounded-4 sticky-top" style={{ top: "100px" }}>
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-4">Összesítés</h5>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Termékek összesen:</span>
                                <span className="fw-medium">{vegosszeg.toLocaleString()} Ft</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4">
                                <span className="text-muted">Szállítás:</span>
                                <span className="text-success fw-medium">Ingyenes</span>
                            </div>
                            <hr className="opacity-10" />
                            <div className="d-flex justify-content-between mb-4 mt-2">
                                <span className="fs-5 fw-bold">Fizetendő:</span>
                                <span className="fs-5 fw-bold text-primary">{vegosszeg.toLocaleString()} Ft</span>
                            </div>
                            <Button 
                                variant="primary" 
                                size="lg" 
                                className="w-100 rounded-pill fw-bold shadow-sm mb-3"
                                onClick={() => navigate("/fizetes")}
                            >
                                Tovább a pénztárhoz
                            </Button>
                            <Button 
                                variant="link" 
                                className="w-100 text-decoration-none text-muted small" 
                                onClick={() => navigate("/")}
                            >
                                Vásárlás folytatása
                            </Button>
                        </Card.Body>
                    </Card>
                </div>
            </Row>
        </Container>
    );
};

export default Kosar;