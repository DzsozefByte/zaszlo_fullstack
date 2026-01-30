import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import httpCommon from '../http-common';
import { IoMdPerson, IoMdMail, IoMdKey, IoMdLogOut } from "react-icons/io";
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';

const Profil = ({ accessToken }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) return;

    const fetchProfil = async () => {
      try {
        const response = await httpCommon.get("/auth/profil", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setUserData(response.data.user);
      } catch (error) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfil();
  }, [accessToken, navigate]);

  if (loading) {
    return (
        <Container className="py-5 mt-5 text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Adataid betöltése folyamatban...</p>
        </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={5}>
          <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="bg-primary text-white text-center py-5 position-relative">
               <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center shadow mx-auto mb-3" style={{width: '90px', height: '90px'}}>
                  <IoMdPerson size={50} />
               </div>
               <h3 className="mb-1 fw-bold">{userData?.nev}</h3>
               <Badge bg="light" text="dark" className="rounded-pill px-3 py-2 text-uppercase letter-spacing-1 shadow-sm">
                  {userData?.jogosultsag || 'vásárló'}
               </Badge>
            </div>
            
            <Card.Body className="p-4 py-5">
                <div className="mb-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <div className="bg-light p-2 rounded-3 text-primary"><IoMdMail size={24}/></div>
                        <div className="flex-grow-1">
                            <small className="text-muted d-block text-uppercase small fw-bold">Email cím</small>
                            <span className="fs-6 fw-medium">{userData?.email}</span>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-3 mb-4">
                        <div className="bg-light p-2 rounded-3 text-primary"><IoMdKey size={24}/></div>
                        <div className="flex-grow-1">
                            <small className="text-muted d-block text-uppercase small fw-bold">Biztonság</small>
                            <span className="fs-6 fw-medium">Jelszó beállítva</span>
                        </div>
                    </div>
                </div>

                <div className="d-grid gap-2 mt-4">
                    <button className="btn btn-outline-primary rounded-pill fw-bold" onClick={() => navigate("/")}>
                        Vissza a kezdőlapra
                    </button>
                    <button className="btn btn-link text-danger text-decoration-none small mt-2">
                        <IoMdLogOut /> Kijelentkezés
                    </button>
                </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profil;