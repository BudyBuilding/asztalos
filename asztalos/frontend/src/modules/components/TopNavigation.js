import React, { useState, useEffect } from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
  import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Dropdown from "react-bootstrap/Dropdown";
import authApi from "../../data/api/authApi";
import {
  getAllClients,
  getAllUsers,
  getAllWorks,
  getUser,
} from "../../data/getters";
import { useDispatch } from "react-redux";

function TopNavigationBar() {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
const [username, setUsername] = useState("");
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await dispatch(getUser());
      setIsAdmin(userData.role === "admin");
      setUsername(userData.username || "");
    };
    fetchUser();
  }, [dispatch]);


  const handleLogout = () => {
    authApi.logoutApi();
  };

  const handleCloseModal = () => setShowModal(false);
  const handleConfirmLogout = () => {
    setShowModal(false);
    handleLogout();
  };

  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    let clients = await dispatch(getAllClients());
    let works = await dispatch(getAllWorks());
    let users = isAdmin ? await dispatch(getAllUsers()) : [];

    // Ensure the data returned is in array format
    clients = Array.isArray(clients) ? clients : [];
    works = Array.isArray(works) ? works : [];
    users = Array.isArray(users) ? users : [];

    let results = [
      ...clients
        .filter(
          (client) =>
            client.name &&
            client.name.toLowerCase().includes(query.toLowerCase())
        )
        .map((client) => ({ ...client, type: "Client" })),
      ...works
        .filter(
          (work) =>
            work.title && work.title.toLowerCase().includes(query.toLowerCase())
        )
        .map((work) => ({ ...work, type: "Work" })),
      ...users
        .filter(
          (user) =>
            user.name && user.name.toLowerCase().includes(query.toLowerCase())
        )
        .map((user) => ({ ...user, type: "User" })),
    ];

    setSearchResults(results);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    handleSearch(e.target.value);
  };
  return (
    <>
      <Navbar expand="lg" sticky="top" style={{ backgroundColor: "#E9E7F1" }} >
        <Container fluid>
           <Navbar.Text className="me-3">
            Üdv, <span style={{fontWeight: "bold"}}>{username}</span>
          </Navbar.Text>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Container
              className="  position-relative "
              style={{
                margin: "auto",
              }}
            >
              <div className="d-flex " style={{ width: "600px",
                     margin: "auto", }}>
                <Form className="d-flex">
                  <Form.Control
                    type="search"
                    placeholder="Search"
                    //className="me-2"
                    aria-label="Search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    style={{ width: "600px",
                     }}
                  />
                  {/*<Button variant="outline-success">Search</Button>*/}
                </Form>
              </div>
              {searchResults.length > 0 && (
                <Container
                className="position-absolute"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Dropdown.Menu
                  show
                  className="mt-2"
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "49%",
                    transform: "translateX(-50%)",
                    width: "600px",
                    textAlign: "left",
                    maxHeight: "50vh", // Maximális magasság beállítása
                    overflowY: "auto", // Görgethetőség engedélyezése
                    scrollBehavior: "smooth",
                    backgroundColor: "white",
                    fontSize: "18px",
                  }}
                >
                  {searchResults.map((result, index) => (
                    <Dropdown.Item key={index} href="#">
                      {result.name || result.title || result.email} <em style={{ fontSize: "0.8em", color: "#6c757d" }}>({result.type})</em>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Container>
              
              )}
            </Container>
            <div
            >
            <div className="d-flex">
           {/*   <Button variant="outline-primary"
                style={{
                  padding: "0",
                  height: "2.5rem",
                  width: "2.5rem",
                  fontSize: "1.5rem",
                  border: "none",
                }}>
                <i className="bi bi-person"></i>
              </Button>

              <Button variant="outline-secondary" 
                style={{
                  padding: "0",
                  height: "2.5rem",
                  width: "2.5rem",
                  fontSize: "1.5rem",
                  border: "none",
                }}>
                <i className="bi bi-gear"></i>
              </Button>

              <Button variant="outline-dark" 
                style={{
                  padding: "0",
                  height: "2.5rem",
                  width: "2.5rem",
                  fontSize: "1.5rem",
                  border: "none",
                }}>
                <i className="bi bi-moon"></i>
              </Button>*/}

              <Button variant="outline-danger"
                style={{
                  padding: "0",
                  height: "2.5rem",
                  width: "2.5rem",
                  fontSize: "1.5rem",
                  border: "none",
                }}
                onClick={() => setShowModal(true)} 
                >
                <i className="bi bi-box-arrow-right"></i>
              </Button>
            </div>

            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to logout? Unsaved changes will be lost.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default TopNavigationBar;
