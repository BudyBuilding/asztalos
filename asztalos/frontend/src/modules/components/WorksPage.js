// WorksPage.js
import React, { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import { getAllWorks } from "../../data/getters";
import Loading from "../helpers/Loading";
function WorksPage() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [render, setRender] = useState(true);
  useEffect(() => {
    function loadWorks() {
      setLoading(false);
      return getAllWorks();
    }
    setWorks(loadWorks());
  }, [render]);
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
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {works.map((work) => (
                <tr key={work.workId}>
                  <td>{work.workId}</td>
                  <td>{work.title}</td>
                  <td>{work.description}</td>
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
