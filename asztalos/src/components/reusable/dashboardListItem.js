import React from "react";
import ListGroup from "react-bootstrap/ListGroup";

function DashboardListItem({ work }) {
  return (
    <ListGroup.Item>
      <div className="d-flex w-100 mb-2 justify-content-between">
        <span className="mb-1 text-start" style={{ width: "15%" }}>
          {work.Client}
        </span>
        <span className="mb-1" style={{ width: "20%" }}>
          {work.Date}
        </span>
        <span className="mb-1" style={{ width: "30%" }}>
          {work.Status}
        </span>
        <span className="mb-1" style={{ width: "20%" }}>
          {work.Price}
        </span>
        <span className="mb-1 text-end" style={{ width: "15%" }}>
          {work.Paid}
        </span>
      </div>
    </ListGroup.Item>
  );
}

export default DashboardListItem;
