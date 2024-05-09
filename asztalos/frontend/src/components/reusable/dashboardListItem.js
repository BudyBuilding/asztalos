import React from "react";
import ListGroup from "react-bootstrap/ListGroup";

function DashboardListItem({ work }) {
  return (
    <ListGroup.Item className="p-0 m-0">
      <div className="d-flex w-100 m-0 p-3 justify-content-between">
        <span className=" text-start w-100" style={{ width: "25%" }}>
          {work.Client}
        </span>
        <span className="w-100 text-center " style={{ width: "25%" }}>
          {work.Date}
        </span>
        <span className="text-center w-100" style={{ width: "25%" }}>
          {work.Status}
        </span>
        <span className="text-center w-100" style={{ width: "25%" }}>
          {work.Price}
        </span>
        <span className="w-100  text-end" style={{ width: "25%" }}>
          {work.Paid}
        </span>
      </div>
    </ListGroup.Item>
  );
}

export default DashboardListItem;
