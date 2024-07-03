import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux"; // useSelector hozzáadva
import { addColor } from "../../data/api/apiService";

const ColorSelector = ({ show, handleClose }) => {
  const dispatch = useDispatch();
  const [colorType, setColorType] = useState("Fa minta");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("door");
  const categories = ["door", "side", "countertop", "saved"];
  const colorTypes = {
    "Fa minta": ["#8B4513", "#A0522D"],
    MDF: ["#808080", "#696969"],
    "Uni színek": ["#FF0000", "#00FF00"],
  };

  const colors = useSelector((state) => state.colors);

  function containAlready() {
    return colors.colors[selectedCategory]?.includes(selectedColor);
  }

  const handleSaveColors = () => {
    if (!containAlready() && selectedColor != "" && selectedColor != null) {
      console.log("hello");
      dispatch({
        type: "UPDATE_COLORS",
        payload: { colors: [selectedColor], category: selectedCategory },
      });
      handleClose();
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Color Selector</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group as={Row} className="mb-3">
            <Col sm={8}>
              {Object.keys(colorTypes).map((type) => (
                <Button
                  key={type}
                  variant={colorType === type ? "primary" : "outline-primary"}
                  className="me-2 mb-2"
                  onClick={() => setColorType(type)}
                >
                  {type}
                </Button>
              ))}
            </Col>
          </Form.Group>

          <Row>
            {colorTypes[colorType].map((color) => (
              <ColorBox key={color} color={color} onSelect={setSelectedColor} />
            ))}
          </Row>

          <Form.Group as={Row} className="mt-3">
            <Col sm={8}>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category
                      ? "primary"
                      : "outline-primary"
                  }
                  className="me-2 mb-2"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </Col>
          </Form.Group>

          {selectedColor && (
            <div className="mt-3">
              Selected Color:{" "}
              <span style={{ color: selectedColor }}>{selectedColor}</span>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveColors}>
            Save Color
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const ColorBox = ({ color, onSelect }) => {
  return (
    <Col
      xs={2}
      className="text-center"
      style={{ backgroundColor: color, height: "5rem", cursor: "pointer" }}
      onClick={() => onSelect(color)}
    >
      <span>{color}</span>
    </Col>
  );
};

export default ColorSelector;
