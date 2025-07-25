// src/components/ItemBox.jsx
import React from "react";

export default function ItemBox({
  x,
  y,
  width,
  height,
  dispWidth,
  widthSuffix,
  dispHeight,
  heightSuffix,
  isSelected,
  isEditing,
  rotation,
  id,
  details,
  onMouseDown,
  onClick
}) {
  const containerStyle = {
    position: "absolute",
    left: x,
    top: y,
    width,
    height,
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    gridTemplateColumns: "auto 1fr auto",
    gridTemplateAreas: `
      ".    top    ."
      "left center right"
      ".  bottom   ."
    `,
    transform: rotation === 1 ? "rotate(90deg)" : "none",
    transformOrigin: "center center",
    border: `1px solid ${isSelected ? "#87CEEB" : "black"}`,
    boxSizing: "border-box",
    cursor: isEditing ? "move" : "pointer",
    zIndex: 2,
    background: "transparent"
  };

  const labelStyle = {
    background: "rgba(255,255,255,0.9)",
    padding: "2px 4px",
    borderRadius: "2px",
    fontSize: "10px",
    whiteSpace: "nowrap"
  };

  return (
    <div style={containerStyle} onMouseDown={onMouseDown} onClick={onClick}>
      {/* Fent közép */}
      <div
        style={{
          ...labelStyle,
          gridArea: "top",
          justifySelf: "center"
        }}
      >
        {dispWidth}
        <br />
        {widthSuffix}
      </div>

      {/* Bal közép */}
      <div
        style={{
          ...labelStyle,
          gridArea: "left",
          alignSelf: "center",
          writingMode: "vertical-rl"
        }}
      >
        {dispHeight}
        <br />
        {heightSuffix}
      </div>

      {/* Önmagában a középső tartalom */}
      <div
        style={{
          gridArea: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none"
        }}
      >
        <span
          style={{
            ...labelStyle,
            fontSize: "12px",
            fontWeight: "bold",
            marginBottom: "2px"
          }}
        >
          {id}
        </span>
        <div style={{ fontSize: "10px", textAlign: "center" }}>{details}</div>
      </div>

      {/* Ha szükséges, alulra további infók */}
      <div
        style={{
          ...labelStyle,
          gridArea: "bottom",
          justifySelf: "center"
        }}
      >
        {/* pl. mennyiség, anyag... */}
      </div>
    </div>
  );
}
