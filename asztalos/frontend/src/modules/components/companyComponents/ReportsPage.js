// src/pages/ReportsPage.js

import React from "react";
import { Card, Container, Row, Col } from "react-bootstrap";

function ReportsPage() {
  return (
    <Container fluid style={{ paddingTop: "2rem" }}>
      <Row className="justify-content-center mb-4">
        <Col xs={12} md={8}>
          <h2>
            <i className="bi bi-bar-chart-fill me-2" /> Kimutatások
          </h2>
          <p className="text-muted">
            Itt találod a fontosabb statisztikákat, kimutatásokat,
            összesítéseket az üzem munkáiról, anyaghasználatról vagy a gyártás
            alakulásáról.
          </p>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col xs={12} md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Példa kimutatás</Card.Title>
              <Card.Text>
                Itt jelennek majd meg a diagramok, összesítések, grafikonok vagy
                táblázatok.
                <br />
                Később bővítheted napi, heti vagy havi bontásban, vagy akár
                export funkcióval is!
              </Card.Text>
              <div className="text-muted mt-3" style={{ fontSize: "0.92em" }}>
                Tipp: Itt lehet{" "}
                <strong>anyagfelhasználás, teljesítmény, munkák száma</strong>{" "}
                stb.
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ReportsPage;
