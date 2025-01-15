// WorksPage.js
import React, { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import { getAllWorks } from "../../data/getters";
import Loading from "../helpers/Loading";
import { useDispatch } from "react-redux"; // Redux hook
import { selectWork } from "../../data/store/actions/workStoreFunctions"; // Action
import { useNavigate } from "react-router-dom"; // Router hook

function WorksPage() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadWorks() {
      const data = await getAllWorks();
      setWorks(data);
      setLoading(false);
    }
    loadWorks();
  }, []);

  // Sor kattintás eseménykezelő
  const handleRowClick = (work) => {
    dispatch(selectWork(work)); // Beállítjuk a kiválasztott munkát a Redux store-ba
    navigate(`/workAnalyzer/${work.workId}`); // Átirányítás a workAnalyzer oldalra
  };

  return (
    <div>
      <h1>Works Page</h1>
      <div style={{ overflowY: "auto", height: "100%" }}>
        {loading ? (
          <Loading />
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {works.map((work) => (
                <tr
                  key={work.workId}
                  onClick={() => handleRowClick(work)} // Sor kattintás
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <td>{work.workId}</td>
                  <td>{work.name}</td>
                  <td>{work.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default WorksPage;
