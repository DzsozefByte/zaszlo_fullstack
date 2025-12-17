import React, { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";

const Kapcsolat = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Üzenet elküldve! Köszönjük a megkeresést.");
  };

  return (
    <div className="container mt-5 mb-5 d-flex justify-content-center">
      <Card className="shadow p-4" style={{ maxWidth: "600px", width: "100%", borderRadius: "15px" }}>
        <h2 className="fw-bold mb-3 text-center">Kapcsolat</h2>
        <p className="text-muted text-center mb-4">
          Vedd fel velünk a kapcsolatot az alábbi űrlap kitöltésével.
        </p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Név</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Add meg a neved..."
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Add meg az email címed..."
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Üzenet</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Írd meg az üzeneted..."
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 rounded-pill">
            Küldés
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Kapcsolat;
