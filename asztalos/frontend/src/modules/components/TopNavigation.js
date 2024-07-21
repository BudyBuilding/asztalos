import React, { useState, useEffect } from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await dispatch(getUser());
      setUser(userData);
      setIsAdmin(userData.role === "admin");
    };
    fetchUser();
  }, [dispatch]);

  const handleMouseEnter = () => setShowDropdown(true);
  const handleMouseLeave = () => setShowDropdown(false);

  const handleLogout = () => {
    authApi.logoutApi();
  };

  const handleShowModal = () => setShowModal(true);
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
      <Navbar expand="lg" sticky="top" className="bg-body-tertiary">
        <Container fluid>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Container
              className="  position-relative "
              style={{
                margin: "auto",
                width: "400px",
              }}
            >
              <div className="d-flex ">
                <Form className="d-flex">
                  <Form.Control
                    type="search"
                    placeholder="Search"
                    className="me-2"
                    aria-label="Search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    style={{ width: "300px" }}
                  />
                  <Button variant="outline-success">Search</Button>
                </Form>
              </div>
              {searchResults.length > 0 && (
                <Container className="position-absolute">
                  <Dropdown.Menu
                    show
                    className="mt-2"
                    style={{
                      top: "0",
                      left: "0",
                      width: "300px",
                      textAlign: "center",
                    }}
                  >
                    {searchResults.map((result, index) => (
                      <Dropdown.Item key={index} href="#">
                        {result.name || result.title || result.email}{" "}
                        <em>({result.type})</em>
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Container>
              )}
            </Container>
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="ms-2"
              style={{ position: "relative", display: "inline-block" }}
            >
              <Button variant="outline-primary">Profile</Button>
              {showDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    zIndex: 1,
                    width: "200px",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <div
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #ccc",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    <strong>{user.name}</strong>
                    <br />
                    {user.email}
                  </div>
                  <Button
                    variant="light"
                    style={{
                      width: "100%",
                      textAlign: "left",
                      borderTop: "1px solid #ccc",
                    }}
                  >
                    Settings
                  </Button>
                  <Button
                    variant="light"
                    style={{
                      width: "100%",
                      textAlign: "left",
                      borderTop: "1px solid #ccc",
                    }}
                    onClick={handleShowModal}
                  >
                    Logout
                  </Button>
                </div>
              )}
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
