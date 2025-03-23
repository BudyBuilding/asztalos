import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { getAllCreatedTables, getAllCreatedItems } from "../../data/getters";
import { updateTables, updateItems } from "../../data/store/actions/objectStoreFunctions";

const CreatedTable = () => {
  const dispatch = useDispatch();
  const [createdTables, setCreatedTables] = useState([]);
  const [createdItems, setCreatedItems] = useState([]);
  const [processedItems, setProcessedItems] = useState([]);
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const [dividerPosition, setDividerPosition] = useState(80);
  const [selectedItemPosition, setSelectedItemPosition] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTables, setEditedTables] = useState([]);
  const [editedItems, setEditedItems] = useState([]);
  const [showNoTableText, setShowNoTableText] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tables = (await dispatch(getAllCreatedTables())) || [];
        const items = (await dispatch(getAllCreatedItems())) || [];
        setCreatedTables(tables);
        setCreatedItems(items);

        const processed = items.map((item) => {
          const positions = parsePositions(item.tablePosition);
          const [originalHeight, originalWidth, thickness] = JSON.parse(item.size || "[0,0,0]");
          
          const processedPositions = positions.map((pos) => {
            const [x, y, rotation, tableId] = pos;
            const isHorizontal = rotation === 1;
            const width = isHorizontal ? originalHeight : originalWidth;
            const height = isHorizontal ? originalWidth : originalHeight;
            return { x, y, rotation, tableId, width, height };
          });

          return {
            ...item,
            processedPositions,
          };
        });

        setProcessedItems(processed);
        if (tables.length === 0) {
          setShowNoTableText(true);
        }
      } catch (error) {
        console.error("Hiba az adatok betöltése közben: ", error);
      }
    };
    fetchData();

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [dispatch]);

  const currentTable = isEditing
    ? editedTables[currentTableIndex]
    : createdTables[currentTableIndex];

  const shownItems = (isEditing ? editedItems : processedItems).filter((item) => {
    if (!item?.tablePosition || typeof item.tablePosition !== "string" || !currentTable?.id) return false;
    const positions = parsePositions(item.tablePosition);
    return positions.some((position) => {
      const [, , , tableId] = position;
      return tableId === currentTable.id;
    });
  });

  const handleNextTable = () => {
    setCurrentTableIndex((prev) => (prev + 1) % createdTables.length);
  };

  const handlePrevTable = () => {
    setCurrentTableIndex((prev) =>
      prev === 0 ? createdTables.length - 1 : prev - 1
    );
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startPosition = dividerPosition;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newPosition = startPosition + (deltaX / window.innerWidth) * 100;
      setDividerPosition(Math.max(20, Math.min(80, newPosition)));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const startEditing = () => {
    setEditedTables([...createdTables]);
    setEditedItems([...processedItems]);
    setIsEditing(true);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        position: "relative",
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: `${dividerPosition}%`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <TableViewer
          table={currentTable}
          items={isEditing ? editedItems : processedItems}
          containerRef={containerRef}
          onNext={handleNextTable}
          onPrev={handlePrevTable}
          selectedItemPosition={selectedItemPosition}
          setSelectedItemPosition={setSelectedItemPosition}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          startEditing={startEditing}
          editedTables={editedTables}
          setEditedTables={setEditedTables}
          editedItems={editedItems}
          setEditedItems={setEditedItems}
          setCreatedTables={setCreatedTables}
          setCreatedItems={setCreatedItems}
          setProcessedItems={setProcessedItems}
          setCurrentTableIndex={setCurrentTableIndex}
          showNoTableText={showNoTableText}
          setShowNoTableText={setShowNoTableText}
        />
      </div>

      <div
        onMouseDown={handleMouseDown}
        style={{
          width: "5px",
          cursor: "ew-resize",
          background: "#aaa",
          height: "100%",
          position: "absolute",
          left: `${dividerPosition}%`,
          top: 0,
          zIndex: 10,
        }}
      />

      <div
        style={{
          width: `${100 - dividerPosition}%`,
          overflowY: "auto",
          overflowX: "hidden",
          marginBottom: "60px",
        }}
      >
        <ItemList
          items={isEditing ? editedItems : processedItems}
          selectedItemPosition={selectedItemPosition}
          setSelectedItemPosition={setSelectedItemPosition}
        />
      </div>
    </div>
  );
};

const TableViewer = ({
  table,
  items,
  containerRef,
  onNext,
  onPrev,
  selectedItemPosition,
  setSelectedItemPosition,
  isEditing,
  setIsEditing,
  startEditing,
  editedTables,
  setEditedTables,
  editedItems,
  setEditedItems,
  setCreatedTables,
  setCreatedItems,
  setProcessedItems,
  setCurrentTableIndex,
  showNoTableText,
  setShowNoTableText,
}) => {
  const dispatch = useDispatch();
  const [scaleFactor, setScaleFactor] = useState(1);
  const [selectedDimension, setSelectedDimension] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const BORDER_WIDTH = 2;

  useEffect(() => {
    if (!containerRef.current || !table) return;

    const resizeObserver = new ResizeObserver(() => {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const [height = 1, width = 1] = JSON.parse(table.size || "[1,1]");
      const scaleW = containerWidth / width;
      const scaleH = containerHeight / height;
      setScaleFactor(Math.min(scaleW, scaleH) * 0.75);
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [table, containerRef]);

  if (showNoTableText) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "20px",
          color: "#666",
        }}
      >
        <p>There is no table, please add one</p>
      </div>
    );
  }

  if (!table) return <p>Loading table...</p>;

  const [height = 0, width = 0, thickness = 0] = JSON.parse(table.size || "[0,0,0]");
  const colorName = table.color?.name || "N/A";

  const parsePositions = (tablePosition) => {
    if (!tablePosition) return [];
    return tablePosition
      .replace(/\]\[/g, "],[")
      .split("],[")
      .map((pos) => pos.replace(/\[|\]/g, "").split(",").map(Number));
  };

  const filteredItems = items.filter((item) => {
    if (!item.tablePosition || typeof item.tablePosition !== "string") return false;
    const positions = parsePositions(item.tablePosition);
    return positions.some((position) => {
      const [, , , tableId] = position;
      return tableId === table.id;
    });
  });

  const generateDiagonalLines = () => {
    const scaledWidth = width * scaleFactor;
    const scaledHeight = height * scaleFactor;
    const lineSpacing = 10;
    const angle = 35 * (Math.PI / 180);
    const diagonalLength = Math.sqrt(scaledWidth * scaledWidth + scaledHeight * scaledHeight);
    const lines = [];
    const totalLines = Math.ceil((width + height) / lineSpacing) * 2;

    for (let i = -totalLines; i <= totalLines; i++) {
      const offset = i * lineSpacing;
      const x1 = offset * Math.cos(angle) - diagonalLength * Math.sin(angle);
      const y1 = offset * Math.sin(angle) + diagonalLength * Math.cos(angle);
      const x2 = offset * Math.cos(angle) + diagonalLength * Math.sin(angle);
      const y2 = offset * Math.sin(angle) - diagonalLength * Math.cos(angle);
      const startX = x1 + scaledWidth / 2;
      const startY = y1 + scaledHeight / 2;
      const endX = x2 + scaledWidth / 2;
      const endY = y2 + scaledHeight / 2;
      lines.push({ x1: startX, y1: startY, x2: endX, y2: endY });
    }
    return lines;
  };

  const handleAddTable = () => {
    const newTable = {
      id: editedTables.length > 0 ? Math.max(...editedTables.map(t => t.id)) + 1 : 1,
      work: {},
      price: 999.99,
      size: "[2780, 2050, 18]",
      color: {
        colorId: 1,
        name: "Red",
        materialType: "Plastic",
        active: true,
        dimension: "[2070, 2050, 18]",
        rotable: false,
        imageId: "http://example.com/color.png",
        price: null,
      },
    };

    const newEditedTables = [...editedTables, newTable];
    setEditedTables(newEditedTables);
    setCurrentTableIndex(newEditedTables.length - 1);

    if (newEditedTables.length === 1 && !isEditing) {
      setIsEditing(true);
      setCreatedTables(newEditedTables);
      setShowNoTableText(false);
      dispatch(updateTables(newEditedTables));
    }
  };

  const handleDeleteTable = () => {
    const confirmDelete = window.confirm(
      "Biztosan törölni szeretnéd ezt a táblát és az ahhoz tartozó itemeket?"
    );
    if (confirmDelete) {
      const tableIdToDelete = table.id;
      const newEditedTables = editedTables.filter((t) => t.id !== tableIdToDelete);
      const newEditedItems = editedItems.filter((item) => {
        const positions = parsePositions(item.tablePosition);
        return !positions.some((position) => {
          const [, , , tableId] = position;
          return tableId === tableIdToDelete;
        });
      });

      setEditedTables(newEditedTables);
      setEditedItems(newEditedItems);
      setProcessedItems(newEditedItems);

      if (newEditedTables.length > 0) {
        setCurrentTableIndex(0);
      } else {
        setCurrentTableIndex(-1);
        setIsEditing(false);
        setShowNoTableText(true);
      }

      dispatch(updateTables(newEditedTables));
      dispatch(updateItems(newEditedItems));
      setCreatedTables(newEditedTables);
      setCreatedItems(newEditedItems);
    }
  };

  const handleSave = () => {
    const confirmSave = window.confirm("Biztosan menteni szeretnéd a változtatásokat?");
    if (confirmSave) {
      dispatch(updateTables(editedTables));
      dispatch(updateItems(editedItems));
      setCreatedTables(editedTables);
      setCreatedItems(editedItems);
      setProcessedItems(editedItems);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm("Biztosan elveted a módosításokat?");
    if (confirmCancel) {
      setIsEditing(false);
    }
  };

  const checkCollision = (newX, newY, itemWidth, itemHeight, currentItemId, currentIndex) => {
    for (const item of filteredItems) {
      const positions = item.processedPositions || parsePositions(item.tablePosition).map((pos) => {
        const [x, y, rotation] = pos;
        const [origHeight, origWidth] = JSON.parse(item.size || "[0,0]");
        const isHorizontal = rotation === 1;
        return {
          x,
          y,
          width: isHorizontal ? origHeight : origWidth,
          height: isHorizontal ? origWidth : origHeight,
        };
      });

      for (let i = 0; i < positions.length; i++) {
        const { x, y, width: otherWidth, height: otherHeight } = positions[i];

        if (item.itemId === currentItemId && i === currentIndex) continue;

        const otherLeft = x;
        const otherRight = x + otherWidth;
        const otherTop = y;
        const otherBottom = y + otherHeight;

        const newLeft = newX;
        const newRight = newX + itemWidth;
        const newTop = newY;
        const newBottom = newY + itemHeight;

        const isColliding =
          newLeft < otherRight &&
          newRight > otherLeft &&
          newTop < otherBottom &&
          newBottom > otherTop;

        if (isColliding) {
          return true;
        }
      }
    }
    return false;
  };

  const findFreePosition = (itemWidth, itemHeight, currentItemId, currentIndex) => {
    const stepSize = 10; // Lépésköz a pozíció kereséshez
    for (let y = 0; y <= height - itemHeight; y += stepSize) {
      for (let x = 0; x <= width - itemWidth; x += stepSize) {
        if (!checkCollision(x, y, itemWidth, itemHeight, currentItemId, currentIndex)) {
          return { x, y };
        }
      }
    }
    return null; // Nincs szabad pozíció
  };

  const handleRotateItem = () => {
    if (!selectedItemPosition || !isEditing) return;

    const { itemId, index } = selectedItemPosition;
    const selectedItem = editedItems.find(item => item.itemId === itemId);
    if (!selectedItem) return;

    const positions = parsePositions(selectedItem.tablePosition);
    const processedPositions = selectedItem.processedPositions || [];
    const [x, y, rotation, tableId] = positions[index];
    const [originalHeight, originalWidth] = JSON.parse(selectedItem.size || "[0,0,0]");

    // Forgatás váltása: 0 -> 1 vagy 1 -> 0
    const newRotation = rotation === 0 ? 1 : 0;
    const newWidth = newRotation === 1 ? originalHeight : originalWidth;
    const newHeight = newRotation === 1 ? originalWidth : originalHeight;

    // Ütközésmentes pozíció keresése
    const freePosition = findFreePosition(newWidth, newHeight, itemId, index);
    if (!freePosition) {
      alert("Nem lehet elforgatni az elemet, mert nincs elég szabad hely.");
      return;
    }

    // Frissítjük a pozíciókat az új hellyel és forgatással
    const newPositions = [...positions];
    newPositions[index] = [freePosition.x, freePosition.y, newRotation, tableId];
    const newTablePosition = newPositions.map(pos => `[${pos.join(",")}]`).join("");

    const updatedItems = editedItems.map((item) =>
      item.itemId === itemId
        ? {
            ...item,
            tablePosition: newTablePosition,
            processedPositions: processedPositions.map((pos, idx) =>
              idx === index
                ? { ...pos, x: freePosition.x, y: freePosition.y, rotation: newRotation, width: newWidth, height: newHeight }
                : pos
            ),
          }
        : item
    );

    setEditedItems(updatedItems);
    setProcessedItems(updatedItems); // Szinkronizáljuk a processedItems-t
  };

  const checkCollisionAndSnap = (newX, newY, itemWidth, itemHeight, currentItemId, currentIndex) => {
    const SNAP_DISTANCE = 20;
    let adjustedX = newX;
    let adjustedY = newY;

    for (const item of filteredItems) {
      const positions = item.processedPositions || parsePositions(item.tablePosition).map((pos) => {
        const [x, y, rotation] = pos;
        const [origHeight, origWidth] = JSON.parse(item.size || "[0,0]");
        const isHorizontal = rotation === 1;
        return {
          x,
          y,
          width: isHorizontal ? origHeight : origWidth,
          height: isHorizontal ? origWidth : origHeight,
        };
      });

      for (let i = 0; i < positions.length; i++) {
        const { x, y, width: otherWidth, height: otherHeight } = positions[i];

        if (item.itemId === currentItemId && i === currentIndex) continue;

        const otherLeft = x;
        const otherRight = x + otherWidth;
        const otherTop = y;
        const otherBottom = y + otherHeight;

        const newLeft = adjustedX;
        const newRight = adjustedX + itemWidth;
        const newTop = adjustedY;
        const newBottom = adjustedY + itemHeight;

        const isColliding =
          newLeft < otherRight &&
          newRight > otherLeft &&
          newTop < otherBottom &&
          newBottom > otherTop;

        if (isColliding) {
          return { collision: true, x: newX, y: newY };
        }

        const distLeft = Math.abs(newRight - otherLeft);
        const distRight = Math.abs(newLeft - otherRight);
        const distTop = Math.abs(newBottom - otherTop);
        const distBottom = Math.abs(newTop - otherBottom);

        if (distLeft < SNAP_DISTANCE && newTop < otherBottom && newBottom > otherTop) {
          adjustedX = otherLeft - itemWidth;
        } else if (distRight < SNAP_DISTANCE && newTop < otherBottom && newBottom > otherTop) {
          adjustedX = otherRight;
        }

        if (distTop < SNAP_DISTANCE && newLeft < otherRight && newRight > otherLeft) {
          adjustedY = otherTop - itemHeight;
        } else if (distBottom < SNAP_DISTANCE && newLeft < otherRight && newRight > otherLeft) {
          adjustedY = otherBottom;
        }
      }
    }

    return { collision: false, x: adjustedX, y: adjustedY };
  };

  const handleItemMouseDown = (e, item, index) => {
    if (!isEditing) return;

    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const positions = parsePositions(item.tablePosition);
    const processedPositions = item.processedPositions || [];
    const [initialX, initialY] = positions[index];
    const { width: itemWidth, height: itemHeight } = processedPositions[index] || {
      width: JSON.parse(item.size || "[0,0]")[1],
      height: JSON.parse(item.size || "[0,0]")[0],
    };
    let currentX = initialX;
    let currentY = initialY;

    const handleMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startX) / scaleFactor;
      const deltaY = (moveEvent.clientY - startY) / scaleFactor;

      let newX = initialX + deltaX;
      let newY = initialY + deltaY;

      newX = Math.max(0, Math.min(newX, width - itemWidth));
      newY = Math.max(0, Math.min(newY, height - itemHeight));

      const { collision, x: adjustedX, y: adjustedY } = checkCollisionAndSnap(
        newX,
        newY,
        itemWidth,
        itemHeight,
        item.itemId,
        index
      );

      if (!collision && (currentX !== adjustedX || currentY !== adjustedY)) {
        currentX = adjustedX;
        currentY = adjustedY;
        const newPositions = [...positions];
        newPositions[index] = [currentX, currentY, positions[index][2], positions[index][3]];
        const newTablePosition = newPositions.map(pos => `[${pos.join(",")}]`).join("");
        const updatedItems = editedItems.map((i) =>
          i.itemId === item.itemId
            ? {
                ...i,
                tablePosition: newTablePosition,
                processedPositions: i.processedPositions.map((p, idx) =>
                  idx === index ? { ...p, x: currentX, y: currentY } : p
                ),
              }
            : i
        );
        setEditedItems(updatedItems);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMoveToTable = (targetTableId) => {
    if (!selectedItemPosition || !isEditing) return;

    const { itemId, index } = selectedItemPosition;
    const selectedItem = editedItems.find(item => item.itemId === itemId);
    if (!selectedItem) return;

    const positions = parsePositions(selectedItem.tablePosition);
    const positionToMove = positions[index];

    const newPosition = [0, 0, positionToMove[2], targetTableId];
    const newPositions = [...positions];
    newPositions.splice(index, 1);
    const newTablePosition = newPositions.length > 0
      ? newPositions.map(pos => `[${pos.join(",")}]`).join("")
      : "";

    const updatedOriginalItem = {
      ...selectedItem,
      tablePosition: newTablePosition,
      processedPositions: selectedItem.processedPositions.filter((_, idx) => idx !== index),
    };
    let updatedItems = editedItems.map(item =>
      item.itemId === itemId ? updatedOriginalItem : item
    );

    if (!newTablePosition) {
      updatedItems = updatedItems.filter(item => item.itemId !== itemId);
    }

    const existingItemOnTarget = updatedItems.find(item =>
      item.tablePosition && parsePositions(item.tablePosition).some(pos => pos[3] === targetTableId)
    );

    if (existingItemOnTarget) {
      const targetPositions = parsePositions(existingItemOnTarget.tablePosition);
      const targetProcessedPositions = existingItemOnTarget.processedPositions || [];
      targetPositions.push(newPosition);
      const newTargetTablePosition = targetPositions.map(pos => `[${pos.join(",")}]`).join("");
      const [origHeight, origWidth] = JSON.parse(selectedItem.size || "[0,0]");
      const isHorizontal = newPosition[2] === 1;
      targetProcessedPositions.push({
        x: 0,
        y: 0,
        rotation: newPosition[2],
        tableId: targetTableId,
        width: isHorizontal ? origHeight : origWidth,
        height: isHorizontal ? origWidth : origHeight,
      });
      updatedItems = updatedItems.map(item =>
        item.itemId === existingItemOnTarget.itemId
          ? { ...item, tablePosition: newTargetTablePosition, processedPositions: targetProcessedPositions }
          : item
      );
    } else {
      const [origHeight, origWidth] = JSON.parse(selectedItem.size || "[0,0]");
      const isHorizontal = newPosition[2] === 1;
      const newItem = {
        ...selectedItem,
        itemId: `${selectedItem.itemId}-${Date.now()}`,
        tablePosition: `[${newPosition.join(",")}]`,
        processedPositions: [{
          x: 0,
          y: 0,
          rotation: newPosition[2],
          tableId: targetTableId,
          width: isHorizontal ? origHeight : origWidth,
          height: isHorizontal ? origWidth : origHeight,
        }],
      };
      updatedItems.push(newItem);
    }

    setEditedItems(updatedItems);
    setSelectedItemPosition(null);
    setShowDropdown(false);

    const targetTableIndex = editedTables.findIndex(t => t.id === targetTableId);
    setCurrentTableIndex(targetTableIndex);
  };

  return (
    <div style={{ padding: "20px", position: "relative", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <button onClick={onPrev} style={buttonStyle}>
          {"<"}
        </button>
        <h2 style={{ margin: "0 20px" }}>Table: {table.id || "N/A"}</h2>
        <button onClick={onNext} style={buttonStyle}>
          {">"}
        </button>
      </div>

      {!isEditing && (
        <button
          onClick={startEditing}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "8px 16px",
            fontSize: "14px",
            cursor: "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Edit Table
        </button>
      )}

      {isEditing && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button
            onClick={handleAddTable}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              cursor: "pointer",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Add Table
          </button>
          <button
            onClick={handleDeleteTable}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              cursor: "pointer",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Delete Table
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              cursor: "pointer",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              cursor: "pointer",
              backgroundColor: "#9E9E9E",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Cancel
          </button>
          {selectedItemPosition && (
            <>
              <button
                onClick={handleRotateItem}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  cursor: "pointer",
                  backgroundColor: "#FFC107",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                Rotate
              </button>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    padding: "8px 16px",
                    fontSize: "14px",
                    cursor: "pointer",
                    backgroundColor: "#FF9800",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                  }}
                >
                  Move to Table {table.id}
                </button>
                {showDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: "0",
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                      zIndex: 100,
                    }}
                  >
                    {editedTables.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleMoveToTable(t.id)}
                        style={{
                          padding: "8px 16px",
                          cursor: "pointer",
                          backgroundColor: t.id === table.id ? "#ddd" : "white",
                        }}
                      >
                        Table {t.id}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <p>
        Dimensions: {height} x {width} x {thickness} | Color: {colorName}
      </p>

      <div
        style={{
          width: `${width * scaleFactor}px`,
          height: `${height * scaleFactor}px`,
          position: "relative",
          margin: "0 auto",
          border: `${BORDER_WIDTH}px solid ${isEditing ? "#4CAF50" : "black"}`,
          boxSizing: "content-box",
          overflow: "hidden",
        }}
      >
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 1,
          }}
          width={width * scaleFactor}
          height={height * scaleFactor}
        >
          <defs>
            <mask id="itemMask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {filteredItems.map((item) =>
                (item.processedPositions || []).map((pos, index) => {
                  const { x, y, width: itemWidth, height: itemHeight, rotation } = pos;
                  const scaledX = x * scaleFactor;
                  const scaledY = y * scaleFactor;
                  const scaledWidth = itemWidth * scaleFactor;
                  const scaledHeight = itemHeight * scaleFactor;
                  if (rotation === 1) {
                    const offsetX = (scaledHeight - scaledWidth) / 2;
                    const offsetY = (scaledWidth - scaledHeight) / 2;
                    return (
                      <rect
                        key={`${item.itemId}-${index}`}
                        x={scaledX - offsetX}
                        y={scaledY - offsetY}
                        width={scaledHeight}
                        height={scaledWidth}
                        fill="black"
                        transform={`rotate(90, ${scaledX + scaledWidth / 2}, ${scaledY + scaledHeight / 2})`}
                      />
                    );
                  }
                  return (
                    <rect
                      key={`${item.itemId}-${index}`}
                      x={scaledX}
                      y={scaledY}
                      width={scaledWidth}
                      height={scaledHeight}
                      fill="black"
                    />
                  );
                })
              )}
            </mask>
          </defs>
          <g mask="url(#itemMask)">
            {generateDiagonalLines().map((line, index) => (
              <line
                key={index}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#ccc"
                strokeWidth="1"
              />
            ))}
          </g>
        </svg>

        <div
          style={{
            position: "absolute",
            top: "-20px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {width}
        </div>

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "-20px",
            transform: "translateY(-50%) rotate(180deg)",
            fontSize: "14px",
            fontWeight: "bold",
            writingMode: "vertical-rl",
            transformOrigin: "center",
          }}
        >
          {height}
        </div>

        {filteredItems.map((item) => {
          const processedPositions = item.processedPositions || [];
          return processedPositions.map((pos, index) => {
            const { x = 0, y = 0, width: itemWidth, height: itemHeight, rotation } = pos;
            const positionKey = `${item.itemId}-${index}`;
            const isSelected =
              selectedItemPosition &&
              selectedItemPosition.itemId === item.itemId &&
              selectedItemPosition.index === index;

            const scaledX = x * scaleFactor;
            const scaledY = y * scaleFactor;
            const scaledWidth = itemWidth * scaleFactor;
            const scaledHeight = itemHeight * scaleFactor;
            let adjustedLeft = scaledX;
            let adjustedTop = scaledY;
            if (rotation === 1) {
              const offsetX = (scaledHeight - scaledWidth) / 2;
              const offsetY = (scaledWidth - scaledHeight) / 2;
              adjustedLeft = scaledX - offsetX;
              adjustedTop = scaledY - offsetY;
            }

            return (
              <div
                key={positionKey}
                onMouseDown={(e) => handleItemMouseDown(e, item, index)}
                onClick={() => {
                  if (isSelected) {
                    setSelectedItemPosition(null);
                    setSelectedDimension(null);
                  } else {
                    setSelectedItemPosition({ itemId: item.itemId, index });
                  }
                }}
                style={{
                  position: "absolute",
                  left: `${adjustedLeft}px`,
                  top: `${adjustedTop}px`,
                  width: `${rotation === 1 ? scaledHeight : scaledWidth}px`,
                  height: `${rotation === 1 ? scaledWidth : scaledHeight}px`,
                  backgroundColor: "transparent",
                  border: `1px solid ${isSelected ? "#87CEEB" : "black"}`,
                  boxSizing: "border-box",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 2,
                  cursor: isEditing ? "move" : "pointer",
                  transform: rotation === 1 ? "rotate(90deg)" : "rotate(0deg)",
                  transformOrigin: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "#999",
                  }}
                >
                  {item.itemId}
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItemPosition({ itemId: item.itemId, index });
                    setSelectedDimension("width");
                  }}
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "10px",
                    textAlign: "center",
                    fontWeight: "normal",
                    marginTop: "2px",
                    cursor: "pointer",
                    padding: "2px",
                    border: `1px solid ${
                      isSelected && selectedDimension === "width" ? "#87CEEB" : "transparent"
                    }`,
                  }}
                >
                  {itemWidth}
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItemPosition({ itemId: item.itemId, index });
                    setSelectedDimension("height");
                  }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "0",
                    transform: "translateY(-50%)",
                    fontSize: "10px",
                    fontWeight: "normal",
                    color: "#333",
                    cursor: "pointer",
                    padding: "2px",
                    border: `1px solid ${
                      isSelected && selectedDimension === "height" ? "#87CEEB" : "transparent"
                    }`,
                  }}
                >
                  {itemHeight}
                </div>
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};

const buttonStyle = {
  padding: "10px",
  fontSize: "20px",
  cursor: "pointer",
  margin: "0 10px",
  backgroundColor: "#f4f4f4",
  border: "1px solid #ccc",
  borderRadius: "50%",
  width: "50px",
  height: "50px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background-color 0.3s",
  textAlign: "center",
};

buttonStyle[":hover"] = {
  backgroundColor: "#ddd",
};

const parsePositions = (positionString) => {
  if (!positionString) return [];
  return positionString
    .replace(/\]\[/g, "],[")
    .split("],[")
    .map((pos) => pos.replace(/\[|\]/g, "").split(",").map(Number));
};

const ItemList = ({ items, selectedItemPosition, setSelectedItemPosition }) => {
  const [selectedItemPositions, setSelectedItemPositions] = useState(null);

  const handleItemClick = (item) => {
    const positions = item.processedPositions || [];
    if (selectedItemPositions && selectedItemPositions.itemId === item.itemId) {
      setSelectedItemPositions(null);
      setSelectedItemPosition(null);
    } else {
      setSelectedItemPositions({ itemId: item.itemId, positions });
    }
  };

  const handlePositionClick = (itemId, index) => {
    const currentSelection = selectedItemPosition;
    if (currentSelection && currentSelection.itemId === itemId && currentSelection.index === index) {
      setSelectedItemPosition(null);
    } else {
      setSelectedItemPosition({ itemId, index });
    }
  };

  return (
    <div style={{ width: "100%", padding: "20px", paddingRight: "0" }}>
      <h2>Item List</h2>
      <div>
        {items.map((item) => {
          const [height = 0, width = 0, thickness = 0] = JSON.parse(item.size || "[0,0,0]");
          const isSelected = selectedItemPositions && selectedItemPositions.itemId === item.itemId;
          return (
            <div
              key={item.itemId}
              onClick={() => handleItemClick(item)}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
                padding: "5px",
                border: `1px solid ${isSelected ? "#87CEEB" : "#ccc"}`,
                borderRadius: "4px",
              }}
            >
              <div style={{ width: "50px", textOverflow: "ellipsis", overflow: "hidden" }}>
                {item.itemId}
              </div>
              <div style={{ width: "100px", textAlign: "left" }}>
                {height} x {width} =
              </div>
              <div style={{ width: "80px", textAlign: "left" }}>{item.qty || 0}</div>
            </div>
          );
        })}
      </div>

      {selectedItemPositions && selectedItemPositions.positions.length > 0 && (
        <div>
          <h3>Table Positions</h3>
          <div>
            {selectedItemPositions.positions.map((position, index) => {
              const { x, y, rotation, tableId, width, height } = position;
              const positionKey = `${selectedItemPositions.itemId}-${index}`;
              const isPositionSelected =
                selectedItemPosition &&
                selectedItemPosition.itemId === selectedItemPositions.itemId &&
                selectedItemPosition.index === index;
              return (
                <div
                  key={positionKey}
                  onClick={() => handlePositionClick(selectedItemPositions.itemId, index)}
                  style={{
                    padding: "10px",
                    marginBottom: "5px",
                    backgroundColor: "#f4f4f4",
                    border: `1px solid ${isPositionSelected ? "#87CEEB" : "#ddd"}`,
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {`Position ${index + 1}: X = ${x}, Y = ${y}, Rotation = ${rotation === 0 ? "Vertical" : "Horizontal"}, Table = ${tableId}, Size = ${height}x${width}`}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatedTable;