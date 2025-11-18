import httpCommon from "../http-common";
import { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Carousel from 'react-bootstrap/Carousel';

const Fooldal = () => {
    const [zaszlok, setZaszlok] = useState([]);

    const fetchData = async () => {
        try {
            const response = await httpCommon.get("/zaszlok");
            setZaszlok(response.data);
        } catch (error) {
            console.error("Hiba az adatok lekérése során:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', backgroundColor: '#f8f9fa', paddingBottom: '2rem' }}>

            {/* Carousel */}
            <div style={{ width: '90%', margin: '2rem 0', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
                <Carousel fade>
                    {[1, 2, 3].map((num) => (
                        <Carousel.Item key={num} interval={3000}>
                            <img
                                className="d-block w-100"
                                src={`/images/stock${num}${num === 2 ? '.jpeg' : '.jpg'}`}
                                alt={`Slide ${num}`}
                                style={{ objectFit: 'cover', height: '400px', filter: 'brightness(85%)' }}
                            />
                            <Carousel.Caption style={{
                                bottom: '20%',
                                background: 'rgba(0,0,0,0.5)',
                                padding: '1rem 2rem',
                                borderRadius: '10px'
                            }}>
                                <h3 style={{ color: '#fff', fontWeight: '700' }}>
                                    {num === 1 ? 'Fedezd fel a világ zászlóit' : num === 2 ? 'Nemzetközi választék' : 'Elegáns és tartós'}
                                </h3>
                                <p style={{ color: '#f1f1f1', fontSize: '1rem' }}>
                                    {num === 1 ? 'Minőségi zászlók minden nemzet számára, közvetlenül Magyarországról.' : num === 2 ? 'Több száz ország zászlója egy helyen – gyűjtőknek és rajongóknak.' : 'Zászlóinkat a legjobb anyagokból készítjük, hogy hosszú ideig kibírják.'}
                                </p>
                            </Carousel.Caption>
                        </Carousel.Item>
                    ))}
                </Carousel>
            </div>

            {/* Card grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.5rem',
                width: '90%',
                justifyItems: 'center'
            }}>
                {zaszlok.map((z, index) => (
                    <Card
                        key={index}
                        style={{
                            width: '100%',
                            minHeight: '380px',
                            borderRadius: '15px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            cursor: 'pointer',
                        }}
                        className="hover-card"
                    >
                        <div
                            style={{
                                height: '200px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                backgroundColor: '#fff',
                                borderTopLeftRadius: '15px',
                                borderTopRightRadius: '15px',
                            }}
                        >
                            <Card.Img
                                variant="top"
                                src={`/images/${z.id}.png`}
                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', padding: '1rem' }}
                            />
                        </div>
                        <Card.Body style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
                            <Card.Title style={{ fontWeight: '600', fontSize: '1.2rem', textAlign: 'center', marginBottom: '1rem' }}>{z.orszag}</Card.Title>
                            <Button variant="primary" style={{ width: '100%', transition: 'all 0.3s' }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = '#0d6efd'}>
                                Részletek
                            </Button>
                        </Card.Body>
                    </Card>
                ))}
            </div>

            <style>{`
                .hover-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 25px rgba(0,0,0,0.2);
                }
            `}</style>
        </div>
    );
};

export default Fooldal;
