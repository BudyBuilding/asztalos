// ColorsPage.js
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Button from "react-bootstrap/Button";
import store from "../../data/store/store";
import Loading from "../helpers/Loading";
import { Nav, Table, Modal, Image } from "react-bootstrap";
import {
  getAllClients,
  getAllUsers,
  getAllWorks,
  getAllColors,
  getImageById,
} from "../../data/getters";
import "bootstrap-icons/font/bootstrap-icons.css";
import AddColorModal from "../modals/AddColorModal";

function ColorsPage() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState([]);
  const [render, setRender] = useState(true);
  const [showColorModal, setShowColorModal] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState("");

  useEffect(() => {
    function loadColors() {
      setLoading(false);
      return getAllColors();
    }
    setColors(loadColors());
  }, [render]);
  const handleImageClick = (imageUrl) => {
    setFullscreenImage(imageUrl);
  };
  return (
    <div>
      <h1>Colors Page</h1>
      <div>
        <p>Manage your colors here.</p>
        <Button variant="primary" onClick={() => setShowColorModal(true)}>
          Add Color
        </Button>
        <AddColorModal
          show={showColorModal}
          onHide={() => setShowColorModal(false)}
        />
        <div style={{ overflowY: "auto", height: "100%", marginTop: "1rem" }}>
          {loading ? (
            <Loading />
          ) : (
            <div className="table-responsive">
              <Table bordered hover responsive className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Dimension</th>
                    <th>Material type</th>
                    <th>Active</th>
                    <th>Rotable</th>
                  </tr>
                </thead>
                <tbody>
                  {colors.map((color) => {
                    const imageId = color.imageId;
                    const imageUrl = dispatch(getImageById(imageId));
                    console.log(imageId, "data:image/jpeg;base64," + imageUrl);
                    return (
                      <tr key={color.colorId}>
                        <td>{color.colorId}</td>
                        <td>
                          <Image
                            src={"data:image/jpeg;base64," + imageUrl}
                            alt={color.name}
                            style={{
                              maxWidth: "100px",
                              maxHeight: "100px",
                              cursor: "pointer",
                            }}
                            onClick={() => handleImageClick(imageUrl)}
                          />
                        </td>
                        <td>{color.name}</td>
                        <td>{color.dimension}</td>
                        <td>{color.materialType}</td>
                        <td>{color.active ? "Active" : "Inactive"}</td>
                        <td>{color.rotable ? "Rotable" : "Non rotable"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </div>
        {/* Fullscreen Image Modal */}
        <Modal show={!!fullscreenImage} onHide={() => setFullscreenImage("")}>
          <Modal.Body>
            <Image
              src={"data:image/jpeg;base64," + fullscreenImage}
              alt="Fullscreen"
              fluid
            />
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default ColorsPage;
