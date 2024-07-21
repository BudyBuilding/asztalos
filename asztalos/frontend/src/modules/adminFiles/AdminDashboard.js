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

function AdminDashboard() {
  const dispatch = useDispatch();

  const [works, setWorks] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [render, setRender] = useState(true);
  const [showNav, setShowNav] = useState(true);
  const [colors, setColors] = useState([]);
  const [showColorModal, setShowColorModal] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState("");

  useEffect(() => {
    setClients(loadClients());
    setWorks(loadWorks());
    setUsers(loadUsers());
    setColors(loadColors());
  }, [render]);

  function loadClients() {
    setLoading(false);
    return getAllClients();
  }

  function loadColors() {
    setLoading(false);
    return getAllColors();
  }

  function loadWorks() {
    setLoading(false);
    return getAllWorks();
  }

  function loadUsers() {
    setLoading(false);
    return getAllUsers();
  }

  function rendering() {
    setRender(!render);
  }

  store.subscribe(() => {
    setRender(!render);
  });

  const handleSelectTab = (tab) => {
    setSelectedTab(tab);
  };

  const renderContent = () => {
    switch (selectedTab) {
      case "dashboard":
        return (
          <div>
            <h1>Welcome to the Admin Dashboard</h1>
            <p>Here you can manage users, clients, and works.</p>
          </div>
        );
      case "users":
        return (
          <div style={{ overflowY: "hidden", height: "100%" }}>
            {loading ? (
              <Loading />
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userId}>
                      <td>{user.userId}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        );
      case "clients":
        return (
          <div style={{ overflowY: "auto", height: "100%" }}>
            {loading ? (
              <Loading />
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.clientId}>
                      <td>{client.clientId}</td>
                      <td>{client.name}</td>
                      <td>{client.contact}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        );
      case "works":
        return (
          <div style={{ overflowY: "auto", height: "100%" }}>
            {loading ? (
              <Loading />
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {works.map((work) => (
                    <tr key={work.workId}>
                      <td>{work.workId}</td>
                      <td>{work.title}</td>
                      <td>{work.description}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        );
      case "scripts":
        return (
          <div>
            <h1>Scripts Management</h1>
            <p>Manage your scripts here.</p>
          </div>
        );
      case "colors":
        return (
          <div>
            <h1>Colors Management</h1>
            <p>Manage your colors here.</p>
            <Button variant="primary" onClick={() => setShowColorModal(true)}>
              Add Color
            </Button>
            <AddColorModal
              show={showColorModal}
              onHide={() => setShowColorModal(false)}
            />
            <div
              style={{ overflowY: "auto", height: "100%", marginTop: "1rem" }}
            >
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
                        console.log(
                          imageId,
                          "data:image/jpeg;base64," + imageUrl
                        );
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
            <Modal
              show={!!fullscreenImage}
              onHide={() => setFullscreenImage("")}
            >
              <Modal.Body>
                <Image
                  src={"data:image/jpeg;base64," + fullscreenImage}
                  alt="Fullscreen"
                  fluid
                />
              </Modal.Body>
            </Modal>
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  const toggleNav = () => {
    setShowNav(!showNav);
  };

  const navLinkStyle = (tab) => {
    return {
      fontWeight: selectedTab === tab ? "bold" : "normal",
      color: selectedTab === tab ? "#007bff" : "#000",
    };
  };

  const handleImageClick = (imageUrl) => {
    setFullscreenImage(imageUrl);
  };

  return (
    <div className="d-flex flex" style={{ minHeight: "90vh" }}>
      <div
        className="d-flex flex-column position-relative"
        style={{
          width: showNav ? "13%" : "3%",
          transition: "width 0.3s",
          borderRight: "1px solid #dee2e6",
          height: "100vh",
        }}
      >
        <Nav className="flex-column pt-3 h-100 align-items-center">
          {showNav ? (
            <>
              <Nav.Link
                onClick={() => handleSelectTab("dashboard")}
                style={navLinkStyle("dashboard")}
              >
                Dashboard
              </Nav.Link>
              <Nav.Link
                onClick={() => handleSelectTab("users")}
                style={navLinkStyle("users")}
              >
                Users
              </Nav.Link>
              <Nav.Link
                onClick={() => handleSelectTab("clients")}
                style={navLinkStyle("clients")}
              >
                Clients
              </Nav.Link>
              <Nav.Link
                onClick={() => handleSelectTab("works")}
                style={navLinkStyle("works")}
              >
                Works
              </Nav.Link>
              <Nav.Link
                onClick={() => handleSelectTab("scripts")}
                style={navLinkStyle("scripts")}
              >
                Scripts
              </Nav.Link>
              <Nav.Link
                onClick={() => handleSelectTab("colors")}
                style={navLinkStyle("colors")}
              >
                Colors
              </Nav.Link>
            </>
          ) : (
            <>
              <Nav.Link
                onClick={() => handleSelectTab("dashboard")}
                className="d-flex justify-content-center align-items-center"
                style={{ width: "100%", height: "3rem" }}
              >
                <i
                  className={`bi ${
                    selectedTab === "dashboard" ? "bi-house-fill" : "bi-house"
                  }`}
                ></i>
              </Nav.Link>
              <Nav.Link
                onClick={() => handleSelectTab("users")}
                className="d-flex justify-content-center align-items-center"
                style={{ width: "100%", height: "3rem" }}
              >
                <i
                  className={`bi ${
                    selectedTab === "users" ? "bi-person-fill" : "bi-person"
                  }`}
                ></i>
              </Nav.Link>
              <Nav.Link
                onClick={() => handleSelectTab("clients")}
                className="d-flex justify-content-center align-items-center"
                style={{ width: "100%", height: "3rem" }}
              >
                <i
                  className={`bi ${
                    selectedTab === "clients" ? "bi-people-fill" : "bi-people"
                  }`}
                ></i>
              </Nav.Link>
              <Nav.Link
                onClick={() => handleSelectTab("works")}
                className="d-flex justify-content-center align-items-center"
                style={{ width: "100%", height: "3rem" }}
              >
                <i
                  className={`bi ${
                    selectedTab === "works" ? "bi-archive-fill" : "bi-archive"
                  }`}
                ></i>
              </Nav.Link>
              <Nav.Link
                onClick={() => handleSelectTab("scripts")}
                className="d-flex justify-content-center align-items-center"
                style={{ width: "100%", height: "3rem" }}
              >
                <i
                  className={`bi ${
                    selectedTab === "scripts"
                      ? "bi-file-earmark-code-fill"
                      : "bi-file-earmark-code"
                  }`}
                ></i>
              </Nav.Link>
              <Nav.Link
                onClick={() => handleSelectTab("colors")}
                className="d-flex justify-content-center align-items-center"
                style={{ width: "100%", height: "3rem" }}
              >
                <i
                  className={`bi ${
                    selectedTab === "colors" ? "bi-palette-fill" : "bi-palette"
                  }`}
                ></i>
              </Nav.Link>
            </>
          )}
        </Nav>
        <Button
          onClick={toggleNav}
          style={{
            position: "absolute",
            top: "50%",
            right: showNav ? "-1.2rem" : "-1.1rem",
            transform: "translateY(-50%)",
            zIndex: 1000,
          }}
          className="rounded-circle"
        >
          {showNav ? "<" : ">"}
        </Button>
      </div>
      <div className="flex-grow-1 position-relative">
        <div
          className="h-100 p-3"
          style={{
            marginLeft: "1rem",
            marginRight: "1rem",
            overflowY: "auto",
          }}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
