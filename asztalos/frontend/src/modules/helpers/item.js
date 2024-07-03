import React, { useState, useEffect } from "react";
import { Form, Container, Row, Col, Button } from "react-bootstrap";
import ErrorModal from "./ErrorModal";

export default function Item({ Item, onItemChange }) {
  const [item, setItem] = useState(Item);
  const [showError, setShowError] = useState(false);

  // a function which from string makes an array, cause in the databes the size, rotation and position is stored in "[0,0,0]" format
  function parseStringToArray(str) {
    try {
      return JSON.parse(str);
    } catch (error) {
      console.error("Error parsing string to array:", error);
      return [];
    }
  }

  // here we are calling the parsing function at the start
  useEffect(() => {
    const parsedSize = parseStringToArray(Item.size);
    setItem((prevItem) => ({
      ...prevItem,
      size: parsedSize,
    }));
  }, [Item.size]);

  // checking if the input is correct
  const validateForm = () => {
    if (item.size.length !== 3) {
      setShowError(true);
      return false;
    }

    if (
      item.size.some((value) => isNaN(value)) ||
      item.size.some((value) => value <= 0)
    ) {
      setShowError(true);
      return false;
    }

    if (item.qty === "" || isNaN(item.qty) || item.qty <= 0) {
      setShowError(true);
      return false;
    }

    return true;
  };

  // if we are changing an item we must save it by onItemChange
  const handleChange = (field, value) => {
    const updatedItem = { ...item, [field]: value };
    if (validateForm()) {
      setItem(updatedItem);
      setShowError(false); // Clear previous error when changing fields
      onItemChange(updatedItem);
    }
  };

  const handleCloseErrorModal = () => {
    setShowError(false);
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
                  value={item.size[0]}
                  onChange={(e) =>
                    handleChange("size", [
                      e.target.value,
                      item.size[1],
                      item.size[2],
                    ])
                  }
                />
              </Form.Group>
              <span className="me-2 ms-2 p-0 text-center">x</span>
              <Form.Group as={Col}>
                <Form.Control
                  className="border-0 p-0 text-center m-0"
                  value={item.size[1]}
                  onChange={(e) =>
                    handleChange("size", [
                      item.size[0],
                      e.target.value,
                      item.size[2],
                    ])
                  }
                />
              </Form.Group>
              <span className="me-2 ms-2 p-0 text-center">=</span>
              <Form.Group as={Col}>
                <Form.Control
                  className="border-0 p-0 text-center m-0"
                  value={item.qty}
                  onChange={(e) => handleChange("qty", e.target.value)}
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
                  onChange={(e) => handleChange("cantType", e.target.value)}
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
                  as="select"
                  value={item.longCant}
                  onChange={(e) => handleChange("longCant", e.target.value)}
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
                  as="select"
                  value={item.shortCant}
                  onChange={(e) => handleChange("shortCant", e.target.value)}
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
                onChange={(e) => handleChange("type", e.target.value)}
              />
            </Col>
          </Form.Group>
        </Col>
      </Row>
      {showError && (
        <ErrorModal
          error="Please fill out all fields correctly."
          onClose={handleCloseErrorModal}
        />
      )}
    </Container>
  );
}
