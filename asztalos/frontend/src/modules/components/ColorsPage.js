// ColorsPage.js
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "react-bootstrap/Button";
import Loading from "../helpers/Loading";
import { Table, Modal, Image } from "react-bootstrap";
import {
  getAllColors,
  getImageById,
} from "../../data/getters";
import AddColorModal from "../modals/AddColorModal";

function ColorsPage() {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.user?.role);

  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState([]);
  const [render, setRender] = useState(true);

  // Szerkesztéshez
  const [showColorModal, setShowColorModal] = useState(false);
  const [editingColor, setEditingColor] = useState(null);

  const [fullscreenImage, setFullscreenImage] = useState("");

    useEffect(() => {
        const orig = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const handleWheel = e => {
          // ha a görgetés a .table-responsive konténeren belül van, engedjük,
          // különben blokkoljuk.
          const tableContainer = e.target.closest(".table-responsive");
          if (!tableContainer) {
            e.preventDefault();
          }
          // ha a tableContainer belsejében vagyunk, hagyjuk, hogy az overflowY: auto kezelje
        };

        window.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
          document.body.style.overflow = orig;
          window.removeEventListener("wheel", handleWheel);
        };
      }, []);

  useEffect(() => {
    const loadColors = async () => {
      setLoading(true);
      const cols = await getAllColors();
      setColors(cols);
      setLoading(false);
    };
    loadColors();
  }, [render]);

  const canModify = ["admin", "companyUser", "companyAdmin"].includes(role);

  const handleRowClick = (color) => {
    if (!canModify) return;
    setEditingColor(color);
    setShowColorModal(true);
  };

  return (
    <div className="pb-5 overflow-hidden">
      
      <div className="container d-xl-block">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="mb-0">Colors Page</h1>
          {canModify && (
            <Button variant="primary" onClick={() => {
              setEditingColor(null);
              setShowColorModal(true);
            }}>
              Add Color
            </Button>
          )}
        </div>

        <AddColorModal
          show={showColorModal}
          colorToEdit={editingColor}
          onHide={() => {
            setShowColorModal(false);
            setEditingColor(null);
            setRender((r) => !r);
          }}
        />

        {loading ? (
          <Loading />
        ) : (
          <div className="table-responsive" style={{ maxHeight: "80vh", overflowY: "auto" }}>
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
//                  const imageUrl = dispatch(getImageById(color.imageId));
                  const imageUrl = color.imageData;
                  const imageType = color.imageContentType || "image/jpeg"; 
                  return (
                    <tr
                      key={color.colorId}
                      onClick={() => handleRowClick(color)}
                      style={{
                        cursor: canModify ? "pointer" : "default",
                        backgroundColor: canModify ? "#f9f9f9" : "transparent"
                      }}
                    >
                      <td>{color.colorId}</td>
                      <td>
                        <Image
//                          src={"data:image/jpeg;base64," + imageUrl}
                          src={`data:${imageType || "image/jpeg"};base64,${imageUrl}`}
                          alt={color.name}
                          style={{
                            width: 100,        // fixed width
                            height: 100,       // fixed height
                            objectFit: "cover",// crop to fill
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFullscreenImage(imageUrl);
                          }}
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
