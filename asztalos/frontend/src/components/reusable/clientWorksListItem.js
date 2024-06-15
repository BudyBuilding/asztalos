import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { IonIcon } from "@ionic/react";
import { trash } from "ionicons/icons";

function ClientWorkListItem({ work, onDelete }) {
  function handleDelete() {
    onDelete(work.workId);
  }
  return (
    <ListGroup.Item>
      <div className="d-flex w-100 mb-2 justify-content-between">
        <span className="mb-1 text-start" style={{ width: "25%" }}>
          {work.measureDate}
        </span>
        <span className="mb-1 text-center" style={{ width: "25%" }}>
          {work.status}
        </span>
        <span className="mb-1 text-center col-3" style={{ width: "25%" }}>
          {work.price}
        </span>
        <span className="mb-1 text-end " style={{ width: "25%" }}>
          {work.paid}
        </span>
        <span>
          <IonIcon
            icon={trash}
            style={{ fontSize: "20px", color: "#dc3545" }}
            onClick={handleDelete}
          />
        </span>
      </div>
    </ListGroup.Item>
  );
}

export default ClientWorkListItem;
