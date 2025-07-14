import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import { getAllSettings } from "../../data/getters";
import settingsApi from "../../data/api/settingsApi";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings || []);

  const [newSetting, setNewSetting] = useState({ name: "", value: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(getAllSettings());
  }, [dispatch]);

  const handleChange = (e) => {
    setNewSetting({ ...newSetting, [e.target.name]: e.target.value });
  };

  const handleAddSetting = async () => {
    const { name, value } = newSetting;

    if (!name.trim()) {
      return setError("Töltsd ki az összes mezőt!");
    }

    try {
      await dispatch(settingsApi.createSettingApi({ name, value }));
      await dispatch(getAllSettings());
      setNewSetting({ name: "", value: "" });
      setError("");
    } catch (err) {
      console.error("Hiba a setting létrehozásakor:", err);
      setError("Hiba történt mentés közben.");
    }
  };

  return (
    <div className="container">
      <h1>Beállítások (Settings)</h1>

      <Form className="mb-4">
        <Row className="align-items-center">
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text>Név</InputGroup.Text>
              <Form.Control
                name="name"
                value={newSetting.name}
                onChange={handleChange}
                placeholder="Pl. Szélesség"
              />
            </InputGroup>
          </Col>
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text>Alapérték</InputGroup.Text>
              <Form.Control
                name="value"
                value={newSetting.value}
                onChange={handleChange}
                placeholder="Pl. 100"
              />
            </InputGroup>
          </Col>
          <Col md="auto">
            <Button variant="primary" onClick={handleAddSetting}>
              Hozzáadás
            </Button>
          </Col>
        </Row>
        {error && <p className="text-danger mt-2">{error}</p>}
      </Form>

      <h4>Meglévő beállítások</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Név</th>
            <th>Alapérték</th>
          </tr>
        </thead>
        <tbody>
          {settings.length === 0 ? (
            <tr>
              <td colSpan="3">Nincs még beállítás</td>
            </tr>
          ) : (
            settings.map((s) => (
              <tr key={s.settingId}>
                <td>{s.settingId}</td>
                <td>{s.name}</td>
                <td>{s.value}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default SettingsPage;
