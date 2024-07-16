import React, { useState } from "react";
import {
  Modal,
  Button,
  Form,
  Col,
  Row,
  Image,
  FloatingLabel,
} from "react-bootstrap";
import colorApi from "../../data/api/colorApi";
import { useDispatch } from "react-redux";

const AddColorModal = ({ show, onHide }) => {
  const dispatch = useDispatch();
  const [colorName, setColorName] = useState("");
  const [colorType, setColorType] = useState("PAL");
  const [colorRotable, setColorRotable] = useState(true);
  const [colorActive, setColorActive] = useState(true);
  const [colorPrice, setColorPrice] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // Általános előnézet a kiválasztott képhez
  const [fullScreenImage, setFullScreenImage] = useState(null); // Állapot a teljes képernyős kép megjelenítéséhez
  const [colorDimension, setColorDimension] = useState("2780 * 2050 * 18");
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setColorName(file.name.split(".")[0]); // Beállítjuk a Color Name mezőt a fájl nevével

      // Kép előnézet generálása
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log(reader.result);
        console.log(reader);
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

    try {
      const imageData = previewImage;
      const newColor = {
        active: colorActive,
        dimension: colorDimension,
        materialType: colorType,
        name: colorName,
        rotable: colorRotable,
        price: colorPrice,
      };

      await dispatch(colorApi.createColorApi(newColor, imageData));

      // Reset form fields
      setColorName("");
      setSelectedFile(null);
      setPreviewImage(null);
      setColorType("PAL");
      setColorRotable(true);
      setColorActive(true);
      setColorPrice(0);
      setColorDimension("2780 * 2050 * 18");

      // Close modal
      onHide();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const openFullScreenImage = () => {
    setFullScreenImage(previewImage);
  };

  const closeFullScreenImage = () => {
    setFullScreenImage(null);
  };

  return (
    <>
      <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Add Color</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit} className="form-inline floating-input">
            <FloatingLabel
              controlId="floatingInput"
              label="Color Name"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Enter color name"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                required
              />
            </FloatingLabel>

            <FloatingLabel
              controlId="colorType"
              label="Material type"
              className="mb-3"
            >
              <Form.Select
                id="colorTypeSelect"
                value={colorType}
                onChange={(e) => {
                  setColorType(e.target.value);
                  switch (e.target.value) {
                    case "MDF":
                      setColorDimension("NaN");
                      break;
                    case "Gizir":
                      setColorDimension("2780 * 1200 * 18");
                      break;
                    default:
                      setColorDimension("2780 * 2050 * 18");
                  }
                }}
              >
                <option value="PAL">PAL</option>
                <option value="MDF">MDF</option>
                <option value="Gizir">Gizir</option>
                <option value="PFL">PFL</option>
              </Form.Select>
            </FloatingLabel>

            <FloatingLabel
              controlId="dimension"
              label="Dimension"
              className="mb-3"
            >
              <Form.Select id="dimensionSelect" value={colorDimension} disabled>
                <option value="2780 * 2050 * 18">2780 * 2050 * 18</option>
                <option value="2780 * 2050 * 18">2780 * 2050 * 18</option>
                <option value="NaN">NaN</option>
                <option value="2780 * 1200 * 18">2780 * 1200 * 18</option>
              </Form.Select>
            </FloatingLabel>

            <FloatingLabel controlId="rotable" className="mt-3" label="Rotable">
              <Form.Select
                id="rotableSelect"
                value={colorRotable}
                onChange={(e) => setColorRotable(e.target.value === "true")}
              >
                <option value="true">Rotable</option>
                <option value="false">Non rotable</option>
              </Form.Select>
            </FloatingLabel>

            <FloatingLabel controlId="active" className="mt-3" label="Active">
              <Form.Select
                id="activeSelect"
                value={colorActive}
                onChange={(e) => setColorActive(e.target.value === "true")}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Form.Select>
            </FloatingLabel>

            <FloatingLabel controlId="price" className="mt-3" label="Price">
              <Form.Control
                type="number"
                placeholder="Enter color price"
                value={colorPrice}
                onChange={(e) => setColorPrice(e.target.value)}
                required
              />
            </FloatingLabel>

            <FloatingLabel
              controlId="imageUpload"
              className="mt-3"
              label="Upload Image"
            >
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
            </FloatingLabel>
            {previewImage && (
              <FloatingLabel
                as={Row}
                controlId="imagePreview"
                label="Preview"
                className="mt-3"
              >
                <Col sm={9}>
                  <div style={{ position: "relative" }}>
                    <Image
                      src={previewImage}
                      alt="Preview"
                      style={{
                        border: "thin solid black",
                        borderRadius: "10%",
                        maxWidth: "100%",
                        maxHeight: "200px",
                        margin: "auto",
                      }}
                      onClick={openFullScreenImage}
                      className="cursor-pointer"
                    />
                    <Button
                      variant="secondary"
                      onClick={openFullScreenImage}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                      }}
                    >
                      Full Screen
                    </Button>
                  </div>
                </Col>
              </FloatingLabel>
            )}
            <div className="buttonbox mt-3">
              <Button variant="secondary" onClick={onHide}>
                Close
              </Button>
              <Button variant="primary" type="submit" className="ms-2">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Teljes képernyős megjelenítés */}
      <Modal
        show={fullScreenImage !== null}
        onHide={closeFullScreenImage}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Full Screen Preview - {colorName}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Image
            src={fullScreenImage}
            alt="Full Screen Preview"
            style={{ maxWidth: "100%", maxHeight: "80vh" }}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddColorModal;
