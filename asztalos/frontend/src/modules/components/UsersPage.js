// UsersPage.js
import React, { useState, useEffect } from "react";
import Loading from "../helpers/Loading";
import { Table } from "react-bootstrap";
import { getAllUsers } from "../../data/getters";
import "bootstrap-icons/font/bootstrap-icons.css";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [render, setRender] = useState(true);
  useEffect(() => {
    function loadUsers() {
      setLoading(false);
      return getAllUsers();
    }

    setUsers(loadUsers());
  }, [render]);
  return (
    <div>
      <h1>Users Page</h1>
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
    </div>
  );
}

export default UsersPage;
