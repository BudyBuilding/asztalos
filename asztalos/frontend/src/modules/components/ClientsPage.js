// ClientsPage.js
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Button from "react-bootstrap/Button";
import store from "../../data/store/store";
import Loading from "../helpers/Loading";
import { Nav, Table, Modal, Image } from "react-bootstrap";
import { getAllClients } from "../../data/getters";
import "bootstrap-icons/font/bootstrap-icons.css";

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [render, setRender] = useState(true);
  useEffect(() => {
    function loadClients() {
      setLoading(false);
      return getAllClients();
    }

    setClients(loadClients());
  }, [render]);

  return (
    <div
      className="h-100 overflow-hidden"
      style={{ overflow: "scroll", height: "100%" }}
    >
      <h1>Clients Page</h1>
      <div style={{ overflowY: "hidden", height: "100%" }}>
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
    </div>
  );
}

export default ClientsPage;
