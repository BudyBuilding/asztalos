import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { FaTrash } from "react-icons/fa";

import { IonIcon } from "@ionic/react";
function DashboardListItem({ work }) {
  return (
    <ListGroup.Item className="p-0 m-0">
      <div className="d-flex w-100 m-0 p-3 justify-content-between">
        <span className=" text-start w-100" style={{ width: "25%" }}>
          {work.client.name}
        </span>
        <span className="w-100 text-center " style={{ width: "25%" }}>
          {work.measureDate}
        </span>
        <span className="text-center w-100" style={{ width: "25%" }}>
          {work.status}
        </span>
        <span className="text-center w-100" style={{ width: "25%" }}>
          {work.price}
        </span>
        <span className="w-100  text-end" style={{ width: "25%" }}>
          {work.paid}
        </span>
        <span
          className="mb-1 text-end"
          style={{ width: "20%", cursor: "pointer" }}
          onClick={() => onDelete(work.id)}
        >
          <FaTrash />
        </span>
      </div>
    </ListGroup.Item>
  );
}

export default DashboardListItem;
