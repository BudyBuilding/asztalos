import React, { useState } from "react";
import { Form, Container, Row, Col } from "react-bootstrap";

export default function Item({ Item, onItemChange, objectID }) {
  const [item, setItem] = useState(Item); // Állapot létrehozása és inicializálása

  const handleItemChange = (updatedItem) => {
    setItem(updatedItem); // Frissítjük az állapotot az új elemmel
    onItemChange(updatedItem, objectID); // Változások továbbítása a szülő komponens felé
  };

  return (
    <Container className="border p-2 my-2">
      <Row className="align-items-center">
        <Col xs={9}>
          <Row>
            <Col className="d-flex">
              <Form.Group as={Col}>
                <Form.Control
                  className="border-0 p-0 text-center m-0"
                  value={item.length}
                  onChange={(e) =>
                    handleItemChange({ ...item, length: e.target.value })
                  }
                />
              </Form.Group>
              <span className="me-2 ms-2 p-0 text-center">x</span>
              <Form.Group as={Col}>
                <Form.Control
                  className="border-0 p-0 text-center m-0"
                  value={item.width}
                  onChange={(e) =>
                    handleItemChange({ ...item, width: e.target.value })
                  }
                />
              </Form.Group>
              <span className="me-2 ms-2 p-0 text-center">=</span>
              <Form.Group as={Col}>
                <Form.Control
                  className="border-0 p-0 text-center m-0"
                  value={item.pcs}
                  onChange={(e) =>
                    handleItemChange({ ...item, pcs: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>
        </Col>
        <Col xs={3}>
          <Row>
            <Col className="me-2 p-0">
              <Form.Group>
                <Form.Control
                  as="select"
                  className="p-0 text-center m-0 w-50"
                  value={item.cantType}
                  onChange={(e) =>
                    handleItemChange({ ...item, cantType: e.target.value })
                  }
                >
                  <option>-</option>
                  <option>04</option>
                  <option>2</option>
                  <option>42</option>
                  <option>1</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Group as={Row}>
            <Col className="me-2">
              <Form.Group>
                <Form.Control
                  className="border-0 p-0 text-center m-0"
                  as="select"
                  value={item.longCant}
                  onChange={(e) =>
                    handleItemChange({ ...item, longCant: e.target.value })
                  }
                >
                  <option>0</option>
                  <option>1</option>
                  <option>2</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col className="me-2">
              <Form.Group>
                <Form.Control
                  className="border-0 p-0 text-center m-0"
                  as="select"
                  value={item.shortCant}
                  onChange={(e) =>
                    handleItemChange({ ...item, shortCant: e.target.value })
                  }
                >
                  <option>0</option>
                  <option>1</option>
                  <option>2</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group as={Row}>
            <Col>
              <Form.Control
                className="border-0 p-0 text-center m-0"
                value={item.type}
                onChange={(e) =>
                  handleItemChange({ ...item, type: e.target.value })
                }
              />
            </Col>
          </Form.Group>
        </Col>
      </Row>
    </Container>
  );
}
