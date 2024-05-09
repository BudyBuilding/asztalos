import React from "react";
import { Container, Row, Col, Dropdown } from "react-bootstrap";

function FurnitureItem(props) {
  const { l, w, q, c, lc, wc, r } = props;

  const getCharacter = (value) => {
    if (value === 1) return "-";
    if (value === 2) return "=";
    return ""; // Ha value nem 1 vagy 2, akkor nincs jel
  };

  // Függvény az r érték alapján megállapítja, hogy megjelenjen-e a forgatható gomb
  const renderRotateButton = () => {
    if (r) {
      return <button className="btn btn-primary">Rotate</button>;
    }
    return null; // Ha r false, akkor ne jelenjen meg a gomb
  };

  return (
    <Container className="border p-2 my-2">
      <Row className="align-items-center">
        <Col xs={9}>
          <Row>
            <Col>
              <span className="m-2">{l}</span>
              <span className="m-2">x</span>
              <span className="m-2">{w}</span>
              <span className="m-2">=</span>
              <span className="m-2">{q}</span>
            </Col>
          </Row>
          <Row>
            <Col>
              <span className="ms-3 fs-2 fw-light p-0 d-inline-block">
                {getCharacter(lc)}
              </span>
              <span className="ms-5 fs-2 fw-light p-0 d-inline-block">
                {getCharacter(wc)}
              </span>
            </Col>
          </Row>
        </Col>
        <Col xs={3}>
          <Row>
            <Col className="text-end">{renderRotateButton()}</Col>
            <Col className="me-2">
              <Dropdown className="text-end">
                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                  {c}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="#">-</Dropdown.Item>
                  <Dropdown.Item href="#">04</Dropdown.Item>
                  <Dropdown.Item href="#">2</Dropdown.Item>
                  <Dropdown.Item href="#">42</Dropdown.Item>
                  <Dropdown.Item href="#">1</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default FurnitureItem;
