import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { IonIcon } from "@ionic/react";
import { trash } from "ionicons/icons";

function DashboardListItem({ work, onDelete, onClick }) {
  return (
    <ListGroup.Item className="p-0 m-0">
      <div
        className="d-flex w-100 m-0 p-3 justify-content-between"
        onClick={() => onClick(work.workId)}
      >
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
          onClick={(event) => {
            event.preventDefault();
            onDelete(work.workId);
          }}
        >
          <IonIcon
            icon={trash}
            style={{ fontSize: "20px", color: "#dc3545" }}
          />
        </span>
      </div>
    </ListGroup.Item>
  );
}

export default DashboardListItem;
