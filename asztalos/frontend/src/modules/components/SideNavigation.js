import React, { useState } from "react";
import { Nav, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useDispatch } from "react-redux";
import {
  getUser,
} from "../../data/getters";
import { useNavigate } from "react-router-dom";

function SideNavigation() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userRole = dispatch(getUser()).role;

  const [showNav, setShowNav] = useState(true);
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
    //  color: "#007bff",
      height: "3rem",
    };
  };

  return (
    <div
      className="d-flex flex-row  "
      style={{
        //color: "#007bff",
       // position: "fixed",
        top: 0,
        left: 0,
        width: showNav ? "10vw" : "3vw",
        height: "inherit",
        transition: "width 0.3s",
        borderRight: "1px solid #dee2e6",
        zIndex: 1000, 
        paddingTop: "1rem",
      }}
    >
      <Nav className="flex-column align-items-left" style={{ position: "fixed" }}>

        <Nav.Link
          onClick={() => handleSelectTab("dashboard")}
          style={navLinkStyle("dashboard")}
        >
          {selectedTab === "dashboard" ? (
            <i className="bi-house-fill  me-2"></i>
          ) : (
            <i className="bi bi-house me-2"></i>
          )}
          {showNav ? "Dashboard" : ""}
        </Nav.Link>
        {userRole === "admin" ? (
          <Nav.Link
            onClick={() => handleSelectTab("users")}
            style={navLinkStyle("users")}
          >
            {selectedTab === "users" ? (
              <i className="bi-person-fill me-2"></i>
            ) : (
              <i className="bi bi-person me-2"></i>
            )}
            {showNav ? "Users" : ""}
          </Nav.Link>
        ) : null}
        <Nav.Link
          onClick={() => handleSelectTab("clients")}
          style={navLinkStyle("clients")}
        >
          {selectedTab === "clients" ? (
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
          {selectedTab === "works" ? (
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
          {selectedTab === "scripts" ? (
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
          {selectedTab === "colors" ? (
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
          position: "fixed",
          top: "40vh",
          right: showNav ? "-1.2rem" : "-1.1rem",
          transform: "translateY(-50%)",
          zIndex: 1000,
          border: "2px solid",
          borderColor: "#007bff",
          borderRadius: "50%",
          backgroundColor: "#F3F5F7",
          color: "#007bff",
          fontWeight: "900",
          left: showNav ? "9vw" : "2vw",
          
        transition: "left 0.3s",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          
        }}
      >
        {showNav ? "<" : ">"}
      </Button>
    </div>
  );
}

export default SideNavigation;
