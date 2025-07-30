// src/modules/helpers/item.js
import React, { useState, useEffect } from "react";
import { Form, Container, Row, Col } from "react-bootstrap";
import { IonIcon } from "@ionic/react";
import {
  reload,
  refreshCircle,
  removeCircleOutline,
  chevronDown,
  chevronForward,
  trash,
  eyeOutline,
  eyeOffOutline
} from "ionicons/icons";
import ErrorModal from "./ErrorModal";

export default function Item({
  Item: initialItem,
  onItemChange,
  onDelete,
  visible = true,
  onToggleVisibility,
  readOnly = false
}) {
  // Helpers to parse stored strings
  function parseStringToArray(str) {
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  }
  function parseBracketString(str) {
    if (!str) return ["", "0", "0"];
    const parts = str
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim());
    return parts.length === 3 ? parts : ["", "0", "0"];
  }

  // State: both the array and its JSON repr
  const [item, setItem] = useState(() => {
    const sizeArr = parseStringToArray(initialItem.size);
    const [cantType, longCant, shortCant] = parseBracketString(
      initialItem.kant
    );
    return {
      ...initialItem,
      sizeArr,
      size: initialItem.size,
      cantType,
      longCant,
      shortCant
    };
  });
  const [showError, setShowError] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  // Sync when parent changes
  useEffect(() => {
    setItem((prev) => ({
      ...prev,
      sizeArr: parseStringToArray(initialItem.size),
      size: initialItem.size
    }));
  }, [initialItem.size]);
  useEffect(() => {
    const [ct, lc, sc] = parseBracketString(initialItem.kant);
    setItem((prev) => ({
      ...prev,
      cantType: ct,
      longCant: lc,
      shortCant: sc
    }));
  }, [initialItem.kant]);

  // Validation
  const validateForm = () => {
    if (
      item.sizeArr.length !== 3 ||
      item.sizeArr.some((v) => isNaN(v) || v <= 0)
    )
      return false;
    if (item.qty === "" || isNaN(item.qty) || item.qty <= 0) return false;
    if (isNaN(Number(item.longCant)) || isNaN(Number(item.shortCant)))
      return false;
    return true;
  };

  // Unified change handler
  const handleChange = (field, value) => {
    console.log(readOnly);
    if (readOnly) return;
    let updated = { ...item };

    if (field === "sizeArr") {
      // coerce to numbers
      const nums = value.map((v) => {
        const n = Number(v);
        return isNaN(n) ? 0 : n;
      });
      updated.sizeArr = nums;
      updated.size = JSON.stringify(nums);
    } else {
      updated[field] = value;
    }

    // rebuild kant string
    if (["cantType", "longCant", "shortCant"].includes(field)) {
      updated.kant = `[${updated.cantType},${updated.longCant},${updated.shortCant}]`;
    }

    setItem(updated);

    if (!readOnly && validateForm()) {
      setShowError(false);
      onItemChange(updated);
    } else {
      setShowError(true);
    }
  };

  // Rotate = swap width/height
  const handleRotate = () => {
    if (readOnly) return;
    handleChange("rotable", !item.rotable);
  };

  const toggleCollapsed = () => setCollapsed((v) => !v);

  const handleDelete = () => {
    if (readOnly) return;
    if (window.confirm("Are you sure you want to delete this item?")) {
      onDelete();
    }
  };

  const inputStyle = {
    width: "3rem",
    padding: "2px 4px",
    border: "1px solid #ccc",
    backgroundColor: readOnly ? "#f8f9fa" : "white"
  };

  return (
    <Container className="p-2 ">
      {/* 1st row: w × h = qty + rotate + chevron */}
      <Row
        className="align-items-center flex-wrap me-2"
        style={{ opacity: visible ? 1 : 0.3 }}
      >
        <Col xs="auto">
          <IonIcon
            icon={visible ? eyeOutline : eyeOffOutline}
            style={{
              cursor: "pointer",
              fontSize: "1.5rem",
              marginLeft: "0.5rem"
            }}
            onClick={(e) => {
              e.stopPropagation(); // NE engedjük tovább a drag‐and‐dropnak
              console.log(
                "typeof onToggleVisibility: ",
                typeof onToggleVisibility
              );
              if (typeof onToggleVisibility === "function") {
                console.log("item, toggle visibel");
                onToggleVisibility();
              }
            }}
          />
        </Col>
        <Col className="d-flex flex-wrap align-items-center ">
          <Form.Control
            className="text-center flex-grow-0"
            style={inputStyle}
            value={item.sizeArr[0]}
            onChange={(e) =>
              handleChange("sizeArr", [
                e.target.value,
                item.sizeArr[1],
                item.sizeArr[2]
              ])
            }
            disabled={readOnly}
          />
          <span className="mx-1">×</span>
          <Form.Control
            className="text-center flex-grow-0"
            style={inputStyle}
            value={item.sizeArr[1]}
            onChange={(e) =>
              handleChange("sizeArr", [
                item.sizeArr[0],
                e.target.value,
                item.sizeArr[2]
              ])
            }
            disabled={readOnly}
          />
          <span className="mx-1">=</span>
          <Form.Control
            className="text-center flex-grow-0"
            style={inputStyle}
            value={item.qty}
            onChange={(e) => handleChange("qty", e.target.value)}
            disabled={readOnly}
          />
          <Form.Control
            className="ms-2"
            style={{ ...inputStyle, width: "40%", flexGrow: "0" }}
            placeholder="Name"
            value={item.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={readOnly}
          />
        </Col>

        {/* rotate button only if rotable; else show disabled style */}
        {!collapsed ? (
          <Col xs="auto">
            <IonIcon
              icon={item.rotable ? reload : removeCircleOutline}
              style={{
                cursor: "pointer",
                fontSize: "1.5rem"
              }}
              onClick={handleRotate}
            />
          </Col>
        ) : (
          <></>
          // <div style={{ width: "1.5rem", height: "1.5rem" }} />
        )}

        {/* collapse chevron */}
        <Col xs="auto">
          <IonIcon
            icon={collapsed ? chevronForward : chevronDown}
            style={{ cursor: "pointer", fontSize: "1.2rem" }}
            onClick={toggleCollapsed}
          />
        </Col>
      </Row>

      {/* expanded section */}
      {!collapsed && (
        <>
          <Row className="mt-2 align-items-center">
            <Col xs="auto">
              <Form.Control
                as="select"
                value={item.longCant}
                onChange={(e) => handleChange("longCant", e.target.value)}
                style={inputStyle}
                disabled={readOnly}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </Form.Control>
            </Col>
            <Col xs="auto">
              <Form.Control
                as="select"
                value={item.shortCant}
                onChange={(e) => handleChange("shortCant", e.target.value)}
                style={inputStyle}
                disabled={readOnly}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </Form.Control>
            </Col>
            <Col xs="auto">
              <Form.Control
                as="select"
                value={item.cantType}
                onChange={(e) => handleChange("cantType", e.target.value)}
                style={inputStyle}
                disabled={readOnly}
              >
                <option value="-">-</option>
                <option value="04">04</option>
                <option value="2">2</option>
                <option value="42">42</option>
                <option value="1">1</option>
              </Form.Control>
            </Col>
            <Col xs="auto">
              <IonIcon
                icon={trash}
                style={{ cursor: "pointer", fontSize: "1.5rem", color: "red" }}
                onClick={handleDelete}
              />
            </Col>
          </Row>

          <Row className="mt-2">
            <Col>
              <Form.Control
                placeholder="Details"
                value={item.details || ""}
                onChange={(e) => handleChange("details", e.target.value)}
                style={{ border: "1px solid #ccc" }}
                disabled={readOnly}
              />
            </Col>
          </Row>
        </>
      )}

      {showError && (
        <ErrorModal
          error="Please fill out all fields correctly."
          onClose={() => setShowError(false)}
        />
      )}
    </Container>
  );
}
