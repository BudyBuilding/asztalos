// UsersPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../helpers/Loading";
import { Table, Button, Modal, Form, Alert, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../data/getters";
import authApi from "../../data/api/authApi";
import "bootstrap-icons/font/bootstrap-icons.css";

function UsersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshToggle, setRefreshToggle] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState("");
  const [createForm, setCreateForm] = useState({
    name: "",
    userName: "",
    email: "",
    address: "",
    role: "user" // 
  });

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const all = await dispatch(getAllUsers());
        const filteredUser = all.filter(user => user.role === "user" );
        setUsers(filteredUser);
      } catch (e) {
        console.error("Failed to load users", e);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [refreshToggle, dispatch]);

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((f) => ({ ...f, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateErr("");
    console.log("Creating user with data:", createForm);        
    try {
      const response = await authApi.registerApi({
        ...createForm,
        password: "Welcome1"
      });

      // assuming backend returns { success: boolean, message?: string, user?: {...} }
      const { success, message } = response.data;
      if (!success) {
        setCreateErr(message || "Failed to create user");
      } else {
        // On success, close modal and reload list
        setShowCreate(false);
        setCreateForm({ name: "", userName: "", email: "", address: "", role: "user" });
        setRefreshToggle((t) => !t);
        const all = await dispatch(getAllUsers());
        setUsers(all);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || JSON.stringify(err.response?.data) || "Failed to create user";
      setCreateErr(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="pb-5 overflow-hidden">
      <div className="container d-xl-block">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="mb-0">Users Page</h1>
          <Button variant="success" onClick={() => { setCreateErr(""); setShowCreate(true); }}>
            + Create new user
          </Button>
        </div>

        <div style={{ height: "80vh", overflowY: "auto", borderRadius: "0.25rem" }}>
          {loading ? (
            <Loading />
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Sold</th>
                  <th>Telephone</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.userId}
                    onClick={() => navigate(`/userAnalyzer/${user.userId}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{user.userId}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.username}</td>
                    <td>{user.sold}</td>
                    <td>{user.telephone}</td>
                    <td>{user.address}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>

        {/* Create User Modal */}
        <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Create new user</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {createErr && <Alert variant="danger">{createErr}</Alert>}
            <Form onSubmit={handleCreateUser}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  name="name"
                  value={createForm.name}
                  onChange={handleCreateChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  name="userName"
                  value={createForm.userName}
                  onChange={handleCreateChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={createForm.email}
                  onChange={handleCreateChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  name="address"
                  value={createForm.address}
                  onChange={handleCreateChange}
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowCreate(false)} className="me-2">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={creating}>
                  {creating ? <Spinner size="sm" animation="border" /> : "Create"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default UsersPage;
