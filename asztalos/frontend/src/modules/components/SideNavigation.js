import React, { useState, useEffect } from "react";
import { Nav, Button, Form, Modal, Dropdown, Container } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useDispatch } from "react-redux";
import {
  getAllClients,
  getAllUsers,
  getAllWorks,
  getUser,
} from "../../data/getters";
import authApi from "../../data/api/authApi";
import { useNavigate } from "react-router-dom";

function SideNavigation() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userRole = dispatch(getUser()).role;

  const [showNav, setShowNav] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState("dashboard");

  const handleSelectTab = (tab) => {
    if (tab !== selectedTab) {
      setSelectedTab(tab);
      navigate(`/${tab}`);
    }
  };

  const toggleNav = () => {
    setShowNav(!showNav);
  };

  const navLinkStyle = (tab) => {
    return {
      fontWeight: selectedTab === tab ? "bold" : "normal",
      color: "#007bff",
      height: "3rem",
    };
  };

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await dispatch(getUser());
      setUser(userData);
      setIsAdmin(userData.role === "admin");
    };
    fetchUser();
  }, [dispatch]);

  const handleMouseEnter = () => {
    setShowNav(true);
    setShowDropdown(true);
  };
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

  const handleSearchClick = () => {
    if (!showNav) {
      setShowNav(true);
    }
  };

  return (
    <div
      className="d-flex flex-row position-relative"
      style={{
        color: "#007bff",
        width: showNav ? "13%" : "3%",
        transition: "width 0.3s",
        borderRight: "1px solid #dee2e6",
        height: "100vh",
      }}
    >
      <Nav className="flex-column pt-3 h-100 align-items-left">
        <Nav.Link
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className=" position-relative "
          style={{ height: "3rem" }}
        >
          {showNav ? (
            <Button variant="outline-primary">{user?.name || "Profile"}</Button>
          ) : (
            <i className={`bi bi-person-check`}></i>
          )}
          {showDropdown && (
            <div
              style={{
                position: "absolute",
                top: "110%",
                left: 15,
                borderRadius: "1rem",
                zIndex: 10,
                width: "200px",
                cursor: "default",
              }}
            >
              <div
                style={{
                  backgroundColor: "#fff",
                  padding: "10px",
                  marginBottom: "5px",
                  border: "1px solid #ccc",
                  borderRadius: "1rem",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
                }}
              >
                <strong>{user?.name}</strong>
                <br />
                {user?.email}
              </div>
              <Button
                variant="light"
                style={{
                  textAlign: "left",
                  width: "100%",
                  padding: "10px",
                  marginBottom: "5px",
                  border: "1px solid #ccc",
                  borderRadius: "1rem",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
                }}
                onClick={() => handleSelectTab("settings")}
              >
                Settings
              </Button>
              <Button
                variant="light"
                style={{
                  textAlign: "left",
                  width: "100%",
                  padding: "10px",
                  marginBottom: "5px",
                  border: "1px solid #ccc",
                  borderRadius: "1rem",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
                }}
                onClick={handleShowModal}
              >
                Logout
              </Button>
            </div>
          )}
        </Nav.Link>
        <Nav.Link
          className=" position-relative"
          onClick={() => setShowNav(true)}
          style={{
            width: "100%",
            height: "3rem",
          }}
        >
          {!showNav ? (
            <div className="justify-content-center">
              <i className={`bi bi-search`}></i>
            </div>
          ) : (
            <div className="d-flex align-items-center">
              <Form className="d-flex w-100">
                <Form.Control
                  type="search"
                  placeholder="Search"
                  className="me-2"
                  aria-label="Search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onClick={handleSearchClick} // Ensure nav opens on click
                  style={{ width: "100%" }}
                />
              </Form>
            </div>
          )}
          {searchResults.length > 0 && (
            <Container className="position-absolute">
              <Dropdown.Menu
                show
                className="mt-2"
                style={{
                  top: "0",
                  left: "0",
                  width: "90%",
                  textAlign: "center",
                }}
              >
                {searchResults.map((result, index) => (
                  <Dropdown.Item
                    key={index}
                    href="#"
                    style={{
                      overflow: "hidden",
                      width: "100%",
                    }}
                  >
                    {result.name || result.title || result.email}{" "}
                    <em
                      key={index}
                      href="#"
                      style={{
                        width: "100%",
                      }}
                    >
                      ({result.type})
                    </em>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Container>
          )}
        </Nav.Link>
        <Nav.Link
          onClick={() => handleSelectTab("dashboard")}
          style={navLinkStyle("dashboard")}
        >
          {selectedTab == "dashboard" ? (
            <i className="bi-house-fill  me-2"></i>
          ) : (
            <i className="bi bi-house me-2"></i>
          )}
          {showNav ? "Dashboard" : ""}
        </Nav.Link>
        {userRole == "admin" ? (
          <Nav.Link
            onClick={() => handleSelectTab("users")}
            style={navLinkStyle("users")}
          >
            {selectedTab == "users" ? (
              <i className="bi-person-fill  me-2"></i>
            ) : (
              <i className="bi bi-person me-2"></i>
            )}
            {showNav ? "users" : ""}
          </Nav.Link>
        ) : null}
        <Nav.Link
          onClick={() => handleSelectTab("clients")}
          style={navLinkStyle("clients")}
        >
          {selectedTab == "clients" ? (
            <i className="bi bi-people-fill me-2"></i>
          ) : (
            <i className="bi bi-people me-2"></i>
          )}

          {showNav ? "Clients" : ""}
        </Nav.Link>
        <Nav.Link
          onClick={() => handleSelectTab("works")}
          style={navLinkStyle("works")}
        >
          {selectedTab == "works" ? (
            <i className="bi bi-archive-fill me-2"></i>
          ) : (
            <i className="bi bi-archive me-2"></i>
          )}
          {showNav ? "Works" : ""}
        </Nav.Link>
        <Nav.Link
          onClick={() => handleSelectTab("scripts")}
          style={navLinkStyle("scripts")}
        >
          {selectedTab == "scripts" ? (
            <i className="bi bi-file-earmark-code-fill me-2"></i>
          ) : (
            <i className="bi bi-file-earmark-code me-2"></i>
          )}
          {showNav ? "Scripts" : ""}
        </Nav.Link>
        <Nav.Link
          onClick={() => handleSelectTab("colors")}
          style={navLinkStyle("colors")}
        >
          {selectedTab == "colors" ? (
            <i className="bi bi-palette-fill me-2"></i>
          ) : (
            <i className="bi bi-palette me-2"></i>
          )}
          {showNav ? "Colors" : ""}
        </Nav.Link>
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
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to log out?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default SideNavigation;
