import React, { useContext } from "react";
import { KosarContext } from "../context/KosarContext";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import { useNavigate } from "react-router-dom";

const Kosar = () => {
    const { kosar, torlesKosarbol, dbModositas, vegosszeg } = useContext(KosarContext);
    const navigate = useNavigate();

    if (kosar.length === 0) {
        return (
            <div className="container mt-5 text-center">
                <h2>A kosarad üres</h2>
                <Button variant="primary" className="mt-3" onClick={() => navigate("/")}>
                    Vásárlás folytatása
                </Button>
            </div>
        );
    }

    return (
        <div className="container mt-4 mb-5">
            <h2 className="mb-4">Kosár tartalma</h2>
            
            <div className="row">
                <div className="col-lg-8">
                    <Table responsive hover className="align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Termék</th>
                                <th>Részletek</th>
                                <th>Ár</th>
                                <th>Mennyiség</th>
                                <th>Összesen</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {kosar.map((item, index) => (
                                <tr key={`${item.id}-${item.meret}-${item.anyag}`}>
                                    <td style={{ width: "100px" }}>
                                        <img 
                                            src={item.kep} 
                                            alt={item.orszag} 
                                            style={{ width: "60px", height: "auto", borderRadius: "4px" }} 
                                        />
                                    </td>
                                    <td>
                                        <strong>{item.orszag} zászló</strong><br />
                                        <small className="text-muted">
                                            Méret: {item.meret} <br />
                                            Anyag: {item.anyag}
                                        </small>
                                    </td>
                                    <td>{item.ar.toLocaleString()} Ft</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <Button 
                                                variant="outline-secondary" 
                                                size="sm"
                                                onClick={() => dbModositas(item.id, item.meret, item.anyag, -1)}
                                            >
                                                -
                                            </Button>
                                            <span>{item.db}</span>
                                            <Button 
                                                variant="outline-secondary" 
                                                size="sm"
                                                onClick={() => dbModositas(item.id, item.meret, item.anyag, 1)}
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </td>
                                    <td className="fw-bold">
                                        {(item.ar * item.db).toLocaleString()} Ft
                                    </td>
                                    <td>
                                        <Button 
                                            variant="danger" 
                                            size="sm"
                                            onClick={() => torlesKosarbol(item.id, item.meret, item.anyag)}
                                        >
                                            <i className="bi bi-trash"></i> Törlés
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>

                <div className="col-lg-4">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title>Összesítés</Card.Title>
                            <hr />
                            <div className="d-flex justify-content-between mb-3">
                                <span>Részösszeg:</span>
                                <span>{vegosszeg.toLocaleString()} Ft</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4">
                                <span>Szállítás:</span>
                                <span>Ingyenes</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4 fw-bold fs-5">
                                <span>Fizetendő:</span>
                                <span>{vegosszeg.toLocaleString()} Ft</span>
                            </div>
                            <Button 
                                variant="success" 
                                size="lg" 
                                className="w-100"
                                onClick={() => navigate("/fizetes")} // <--- EZ A LÉNYEG
                            >
                                Tovább a fizetéshez
                            </Button>
                            <Button 
                                variant="outline-primary" 
                                className="w-100 mt-2" 
                                onClick={() => navigate("/")}
                            >
                                Vásárlás folytatása
                            </Button>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Kosar;