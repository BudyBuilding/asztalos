import React, { forwardRef } from "react";

/**
 * Renders a single table layout for export (black-and-white), offscreen.
 * Props:
 *  - table: { id, size: "[h,w,th]", color? }
 *  - items: array of processed items with .processedPositions
 *  - scaleFactor: number
 *  - width, height: numeric dimensions parsed from table.size
 */
const TableCanvas = forwardRef(({ table, items, scaleFactor, width, height }, ref) => {
  const BORDER_WIDTH = 2;

  // Only those positions belonging to this table
  const filteredItems = items.flatMap(item =>
    item.processedPositions
      .filter(p => p.tableId === table.id)
      .map(pos => ({ ...pos, itemId: item.itemId }))
  );

  // Generate diagonal lines across mask
  const generateDiagonalLines = () => {
    const scaledW = width * scaleFactor;
    const scaledH = height * scaleFactor;
    const spacing = 10;
    const angle  = 35 * (Math.PI / 180);
    const diagLen = Math.sqrt(scaledW*scaledW + scaledH*scaledH);
    const total   = Math.ceil((width + height) / spacing) * 2;
    const lines = [];
    for (let i = -total; i <= total; i++) {
      const offset = i * spacing;
      const x1 = offset * Math.cos(angle) - diagLen * Math.sin(angle);
      const y1 = offset * Math.sin(angle) + diagLen * Math.cos(angle);
      const x2 = offset * Math.cos(angle) + diagLen * Math.sin(angle);
      const y2 = offset * Math.sin(angle) - diagLen * Math.cos(angle);
      lines.push({ x1: x1 + scaledW/2, y1: y1 + scaledH/2, x2: x2 + scaledW/2, y2: y2 + scaledH/2 });
    }
    return lines;
  };

  return (
    <div
      ref={ref}
      style={{
        width: `${width * scaleFactor}px`,
        height: `${height * scaleFactor}px`,
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#fff",
        border: `${BORDER_WIDTH}px solid #000`,
        boxSizing: "content-box"
      }}
    >
      <svg
        width={width * scaleFactor}
        height={height * scaleFactor}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <defs>
          <mask id="itemMask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {filteredItems.map((pos, idx) => {
              const { x, y, rotation, width: w, height: h, itemId } = pos;
              const sx = x * scaleFactor;
              const sy = y * scaleFactor;
              const sw = w * scaleFactor;
              const sh = h * scaleFactor;
              if (rotation === 1) {
                const dx = (sh - sw) / 2;
                const dy = (sw - sh) / 2;
                return (
                  <rect
                    key={`${itemId}-${idx}`}
                    x={sx - dx}
                    y={sy - dy}
                    width={sh}
                    height={sw}
                    fill="black"
                    transform={`rotate(90, ${sx + sw/2}, ${sy + sh/2})`}
                  />
                );
              }
              return <rect key={`${itemId}-${idx}`} x={sx} y={sy} width={sw} height={sh} fill="black" />;
            })}
          </mask>
        </defs>
        <g mask="url(#itemMask)">
          {generateDiagonalLines().map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(0,0,0,0.5)"
              strokeWidth="1"
              style={{ mixBlendMode: "difference" }}
            />
          ))}
        </g>
      </svg>

      {/* width label */}
      <div
        style={{
          position: "absolute",
          top: "-20px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "12px",
          fontWeight: "bold"
        }}
      >
        {width}
      </div>
      {/* height label */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "-20px",
          transform: "translateY(-50%) rotate(180deg)",
          writingMode: "vertical-rl",
          fontSize: "12px",
          fontWeight: "bold"
        }}
      >
        {height}
      </div>
    </div>
  );
});

export default TableCanvas;
