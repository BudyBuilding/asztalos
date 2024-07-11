import React, { useState } from "react";
import { Modal, Button, Form, Col, Row, Image } from "react-bootstrap";

const AddColorModal = ({ show, onHide }) => {
  const [colorName, setColorName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // Általános előnézet a kiválasztott képhez
  const [fullScreenImage, setFullScreenImage] = useState(null); // Állapot a teljes képernyős kép megjelenítéséhez

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setColorName(file.name.split(".")[0]); // Beállítjuk a Color Name mezőt a fájl nevével

    // Kép előnézet generálása
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

    // Create FormData object to send file and color name
    const formData = new FormData();
    formData.append("colorName", colorName);
    formData.append(
      "file",
      selectedFile,
      `${colorName}.${selectedFile.name.split(".").pop()}`
    );

    // Example fetch request to send formData to server
    fetch("/api/upload-color", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        // Reset form fields
        setColorName("");
        setSelectedFile(null);
        setPreviewImage(null);
        // Close modal
        onHide();
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle error
      });
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
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="colorName">
              <Form.Label>Color Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter color name"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="imageUpload">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
            </Form.Group>
            {previewImage && (
              <Form.Group as={Row} controlId="imagePreview">
                <Form.Label column sm={3}>
                  Preview
                </Form.Label>
                <Col sm={9}>
                  <div style={{ position: "relative" }}>
                    <Image
                      src={previewImage}
                      alt="Preview"
                      style={{ maxWidth: "100%", maxHeight: "200px" }}
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
              </Form.Group>
            )}
            <Button variant="secondary" onClick={onHide}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
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
          <Modal.Title>Full Screen Preview</Modal.Title>
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
