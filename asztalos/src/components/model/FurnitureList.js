import React from "react";
import FurnitureModel from "./FurnitureModel";

function FurnitureList({ items }) {
  return (
    <>
      {Object.values(items).map((item, index) => (
        <FurnitureModel
          key={index}
          length={item.length}
          width={item.width}
          height={item.height}
        />
      ))}
    </>
  );
}

export default FurnitureList;
