// FurnitureList.js
import React from "react";
import FurnitureModel from "./FurnitureModel";

function FurnitureList({ objects, sceneRef }) {
  return (
    <div>
      {objects.map((object) => (
        <FurnitureModel
          key={object.key}
          length={object.size.width}
          width={object.size.height}
          height={object.size.depth}
          sceneRef={sceneRef}
        />
      ))}
    </div>
  );
}

export default FurnitureList;
