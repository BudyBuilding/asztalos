// src/modules/components/companyComponents/EmployeePage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Modal, Form, Alert, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../helpers/Loading";
import { getAllUsers } from "../../../data/getters";
import authApi from "../../../data/api/authApi";

function EmployeePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector(state => state.auth.user?.role);

  const [employees, setEmployees] = useState([]);
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
    role: "companyUser"
  });

  // only admin or companyAdmin may add employees
  const canAddEmployee = ["admin","companyAdmin"].includes(role);
  // if current user is admin or companyAdmin, include companyAdmin in list
  const includeAdmins = canAddEmployee;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const all = await dispatch(getAllUsers());
        // filter: always include companyUser; optionally also companyAdmin
        const filtered = all.filter(u =>
          u.role === "companyUser" ||
          (includeAdmins && u.role === "companyAdmin")
        );
        setEmployees(filtered);
      } catch (e) {
        console.error("Failed to load employees", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshToggle, dispatch, includeAdmins]);

  const handleCreateChange = e => {
    const { name, value } = e.target;
    setCreateForm(f => ({ ...f, [name]: value }));
  };

  const handleCreate = async e => {
    e.preventDefault();
    setCreating(true);
    setCreateErr("");
    try {
      const res = await authApi.registerApi({
        ...createForm,
        password: "Welcome1"
      });
      const { success, message } = res.data;
      if (!success) {
        setCreateErr(message || "Failed to create employee");
      } else {
        setShowCreate(false);
        setCreateForm({
          name: "", userName: "", email: "", address: "", role: "companyUser"
        });
        setRefreshToggle(t => !t);
      }
    } catch (err) {
      console.error(err);
      setCreateErr(
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        "Failed to create employee"
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="pb-5 overflow-hidden">
      <div className="container d-xl-block">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="mb-0">Employees</h1>
          {canAddEmployee && (
            <Button
              variant="success"
              onClick={() => { setCreateErr(""); setShowCreate(true); }}
            >
              + Add Employee
            </Button>
          )}
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
                  <th>Role</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr
                    key={emp.userId}
                    onClick={() => navigate(`/userAnalyzer/${emp.userId}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{emp.userId}</td>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.username}</td>
                    <td>{emp.role}</td>
                    <td>{emp.address}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>

        {/* Create Employee Modal */}
        <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Add Employee</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {createErr && <Alert variant="danger">{createErr}</Alert>}
            <Form onSubmit={handleCreate}>
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

              {/* Let admin/companyAdmin choose the new employee’s role */}
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={createForm.role}
                onChange={handleCreateChange}
                required
              >
                <option value="companyUser">Company User</option>
                <option value="companyAdmin">Company Admin</option>
              </Form.Select>
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
                <Button
                  variant="secondary"
                  onClick={() => setShowCreate(false)}
                  className="me-2"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={creating}>
                  {creating
                    ? <Spinner size="sm" animation="border" />
                    : "Add"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default EmployeePage;
