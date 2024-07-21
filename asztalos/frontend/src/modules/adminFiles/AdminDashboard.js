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

  store.subscribe(() => {
    setRender(!render);
  });

  return (
    <div className="d-flex flex" style={{ minHeight: "90vh" }}>
      <div className="flex-grow-1 position-relative">
        <div
          className="h-100 p-3"
          style={{
            marginLeft: "1rem",
            marginRight: "1rem",
            overflowY: "auto",
          }}
        ></div>
      </div>
    </div>
  );
}

export default AdminDashboard;
