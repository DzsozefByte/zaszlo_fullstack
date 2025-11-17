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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh' }}>

            {/* Carousel */}
            <div style={{ width: '80%', marginBottom: '2rem' }}>
                <Carousel>
                    <Carousel.Item interval={1000}>
                        <img
                            className="d-block w-100"
                            src="/images/stock1.jpg"
                            alt="First slide"
                            style={{ objectFit: 'cover', height: '400px' }}
                        />
                        <Carousel.Caption
                            style={{
                                color: 'black',
                                background: 'rgba(255,255,255,0.8)',
                                borderRadius: '8px',
                                padding: '1rem',
                                textShadow: 'none',
                            }}
                        >
                            <h3 style={{ color: 'black', textShadow: 'none' }}>Fedezd fel a világ zászlóit</h3>
                            <p style={{ color: 'black', textShadow: 'none' }}>
                                Minőségi zászlók minden nemzet számára, közvetlenül Magyarországról.
                            </p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item interval={1000}>
                        <img
                            className="d-block w-100"
                            src="/images/stock2.jpeg"
                            alt="Second slide"
                            style={{ objectFit: 'cover', height: '400px' }}
                        />
                        <Carousel.Caption
                            style={{
                                color: 'black',
                                background: 'rgba(255,255,255,0.8)',
                                borderRadius: '8px',
                                padding: '1rem',
                                textShadow: 'none',
                            }}
                        >
                            <h3 style={{ color: 'black', textShadow: 'none' }}>Nemzetközi választék</h3>
                            <p style={{ color: 'black', textShadow: 'none' }}>
                                Több száz ország zászlója egy helyen – gyűjtőknek és rajongóknak.
                            </p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src="/images/stock3.jpg"
                            alt="Third slide"
                            style={{ objectFit: 'cover', height: '400px' }}
                        />
                        <Carousel.Caption
                            style={{
                                color: 'black',
                                background: 'rgba(255,255,255,0.8)',
                                borderRadius: '8px',
                                padding: '1rem',
                                textShadow: 'none',
                            }}
                        >
                            <h3 style={{ color: 'black', textShadow: 'none' }}>Elegáns és tartós</h3>
                            <p style={{ color: 'black', textShadow: 'none' }}>
                                Zászlóinkat a legjobb anyagokból készítjük, hogy hosszú ideig kibírják.
                            </p>
                        </Carousel.Caption>
                    </Carousel.Item>
                </Carousel>
            </div>
            {/* Card grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                {zaszlok.map((z, index) => (
                    <Card
                        style={{
                            width: '18rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '400px',
                        }}
                        key={index}
                    >
                        <div
                            style={{
                                height: '200px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                            }}
                        >
                            <Card.Img
                                variant="top"
                                src={`/images/${z.id}.png`}
                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                            />
                        </div>
                        <Card.Body
                            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', flexGrow: 1 }}
                        >
                            <Card.Title>{z.orszag}</Card.Title>
                            <div style={{ marginTop: 'auto' }}>
                                <Button variant="primary">Részletek</Button>
                            </div>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Fooldal;
