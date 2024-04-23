import React from "react";
import { Container, Row, Col, Dropdown } from "react-bootstrap";

export default function Item({ item }) {
  console.log(item);
  const { length, width, cantType, longCant, shortCant, pcs, type } = item;
  console.log(length, width, cantType, longCant, shortCant, pcs, type);
  const getCharacter = (value) => {
    if (value === 1) return "-";
    if (value === 2) return "=";
    return ""; // Ha value nem 1 vagy 2, akkor nincs jel
  };

  return (
    <Container className="border p-2 my-2">
      <Row className="align-items-center">
        <Col xs={9}>
          <Row>
            <Col className="d-flex">
              <div className="m-2 text-center d-flex flex-column">
                <span>{length}</span>
                <span>{getCharacter(longCant)}</span>
              </div>
              <span className="m-2">x</span>

              <div className="m-2 text-center d-flex flex-column">
                <span>{width}</span>
                <span>{getCharacter(shortCant)}</span>
              </div>
              <span className="m-2">=</span>
              <span className="m-2">{pcs}</span>
            </Col>
          </Row>
        </Col>
        <Col xs={3}>
          <Row>
            {/*<Col className="text-end">{renderRotateButton()}</Col>
             */}
            <Col className="me-2">
              <Dropdown className="text-end">
                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                  {cantType}
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
