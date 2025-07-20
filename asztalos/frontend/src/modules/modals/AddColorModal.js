import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Col,
  Row,
  Image,
  FloatingLabel
} from "react-bootstrap";
import colorApi from "../../data/api/colorApi";
import { useDispatch } from "react-redux";
import { getImageById } from "../../data/getters";

const AddColorModal = ({ show, onHide, colorToEdit }) => {
  const dispatch = useDispatch();
  const isEdit = Boolean(colorToEdit);

  // form state
  const [colorName, setColorName] = useState("");
  const [colorType, setColorType] = useState("PAL");
  const [colorRotable, setColorRotable] = useState(true);
  const [colorActive, setColorActive] = useState(true);
  const [colorPrice, setColorPrice] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [colorDimension, setColorDimension] = useState("[2780,2050,18]");

  // on open, populate form and load image if editing
  useEffect(() => {
    if (isEdit) {
      setColorName(colorToEdit.name);
      setColorType(colorToEdit.materialType);
      setColorRotable(colorToEdit.rotable);
      setColorActive(colorToEdit.active);
      setColorPrice(colorToEdit.price);
      setColorDimension(colorToEdit.dimension);
      setSelectedFile(null);

      /*    // fetch existing image by id
      if (colorToEdit.imageId) {
        (async () => {
          try {
            const base64 = await dispatch(getImageById(colorToEdit.imageId));
            setPreviewImage("data:image/jpeg;base64," + base64);
          } catch (err) {
            console.error("Failed to load image for edit:", err);
            setPreviewImage(null);
          }
        })();
      } else {
        setPreviewImage(null);
      }*/

      if (colorToEdit.imageData) {
        setPreviewImage("data:image/jpeg;base64," + colorToEdit.imageData);
      } else {
        setPreviewImage(null);
      }
    } else {
      // reset fields for add
      setColorName("");
      setColorType("PAL");
      setColorRotable(true);
      setColorActive(true);
      setColorPrice(0);
      setSelectedFile(null);
      setPreviewImage(null);
      setColorDimension("[2780,2050,18]");
    }
  }, [isEdit, colorToEdit, dispatch]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setColorName(file.name.split(".")[0]);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  /*const handleSubmit = async (event) => {
    event.preventDefault();
    if (!previewImage) {
      alert("Please select or keep an image.");
      return;
    }

    const colorData = {
      imageId : 0,
      active: colorActive,
      dimension: colorDimension,
      materialType: colorType,
      name: colorName,
      rotable: colorRotable,
      price: colorPrice,
    };
    try {
      if (isEdit) {
        await dispatch(
          colorApi.updateColorApi(colorToEdit.colorId, colorData, previewImage)
        );
      } else {
        await dispatch(colorApi.createColorApi(colorData, previewImage));
      }
      onHide();
    } catch (error) {
      console.error("Error saving color:", error);
    }
  };*/
  const resizeBase64Image = (base64Str, maxWidth = 100, maxHeight = 100) => {
    return new Promise((resolve) => {
      const img = new window.Image(); // ← a fontos különbség itt
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(resizedDataUrl);
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!previewImage) {
      alert("Kérlek tölts fel képet.");
      return;
    }

    const colorData = {
      imageId: 0,
      active: colorActive,
      dimension: colorDimension,
      materialType: colorType,
      name: colorName,
      rotable: colorRotable,
      price: colorPrice
    };

    try {
      // Generate reduced-size version
      const reduced = await resizeBase64Image(previewImage);
      const imageContentType = previewImage.split(";")[0].split(":")[1];
      const imageBase64 = previewImage.split(",")[1];
      const reducedBase64 = reduced.split(",")[1];

      // Merge image data into payload
      const payload = {
        ...colorData,
        imageContentType,
        imageData: imageBase64,
        imageDataReduced: reducedBase64
      };

      if (isEdit) {
        await dispatch(
          colorApi.updateColorApi(colorToEdit.colorId, payload, null) // imageData külön nem kell
        );
      } else {
        await dispatch(colorApi.createColorApi(payload, null));
      }

      onHide();
    } catch (error) {
      console.error("Error saving color:", error);
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEdit ? "Szín szerkesztése" : "Szín hozzáadása"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              {/* Left: Form fields */}
              <Col md={6}>
                <FloatingLabel
                  controlId="floatingColorName"
                  label="Szín neve"
                  className="mb-3"
                >
                  <Form.Control
                    type="text"
                    placeholder="Írd be a szín nevét"
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                    required
                  />
                </FloatingLabel>
                <Row className="g-3">
                  <Col>
                    <FloatingLabel controlId="colorType" label="Anyag">
                      <Form.Select
                        value={colorType}
                        onChange={(e) => {
                          const v = e.target.value;
                          setColorType(v);
                          if (v === "MDF") setColorDimension("NaN");
                          else if (v === "Gizir")
                            setColorDimension("[2780,1200,18]");
                          else setColorDimension("[2780,2050,18]");
                        }}
                      >
                        <option value="PAL">PAL</option>
                        <option value="MDF">MDF</option>
                        <option value="Gizir">Gizir</option>
                        <option value="PFL">PFL</option>
                      </Form.Select>
                    </FloatingLabel>
                  </Col>
                  <Col>
                    <FloatingLabel controlId="dimension" label="Méretek">
                      <Form.Control value={colorDimension} disabled />
                    </FloatingLabel>
                  </Col>
                </Row>
                <Row className="g-3 mt-3">
                  <Col>
                    <FloatingLabel controlId="rotable" label="Forgathatóság">
                      <Form.Select
                        value={String(colorRotable)}
                        onChange={(e) =>
                          setColorRotable(e.target.value === "true")
                        }
                      >
                        <option value="true">Forgatható</option>
                        <option value="false">Nem forgatható</option>
                      </Form.Select>
                    </FloatingLabel>
                  </Col>
                  <Col>
                    <FloatingLabel controlId="active" label="Elérhetőség">
                      <Form.Select
                        value={String(colorActive)}
                        onChange={(e) =>
                          setColorActive(e.target.value === "true")
                        }
                      >
                        <option value="true">Elérhető</option>
                        <option value="false">Nem érhető el</option>
                      </Form.Select>
                    </FloatingLabel>
                  </Col>
                  <Col>
                    <FloatingLabel controlId="price" label="Ár">
                      <Form.Control
                        type="number"
                        placeholder="Írd be az árat"
                        value={colorPrice}
                        onChange={(e) => setColorPrice(e.target.value)}
                        required
                      />
                    </FloatingLabel>
                  </Col>
                </Row>
                <FloatingLabel
                  className="mt-3"
                  controlId="imageUpload"
                  label="Kép"
                >
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </FloatingLabel>
                {/* show a note when editing and no new file chosen */}
                {isEdit && !selectedFile && previewImage && (
                  <Form.Text className="text-muted">
                    Jelenleg betöltött kép (cserélheted ha újat választasz ki)
                  </Form.Text>
                )}
              </Col>

              {/* Right: Large preview */}
              <Col
                md={6}
                className="d-flex justify-content-center align-items-center"
              >
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Előnézet"
                    fluid
                    style={{
                      width: "100%",
                      height: "50vh",
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      overflow: "hidden",
                      cursor: "pointer"
                    }}
                    onClick={() => setFullScreenImage(previewImage)}
                  />
                ) : (
                  <div className="text-muted">Nincs kép kiválasztva</div>
                )}
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
              Mégsem
            </Button>
            <Button variant="primary" type="submit">
              {isEdit ? "Módosítások mentése" : "Szín hozzáadása"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Fullscreen Preview */}
      <Modal
        show={!!fullScreenImage}
        onHide={() => setFullScreenImage(null)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Előnézet - {colorName}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Image src={fullScreenImage} fluid />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddColorModal;
