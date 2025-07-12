// src/modules/helpers/GeneratedItemsList.js
import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { IonIcon } from "@ionic/react";
import { chevronDown, chevronForward } from "ionicons/icons";
import Item from "./item.js";

export default function GeneratedItemsList({
  generatedItems,
  palette,
  collapsedColors,
  toggleColor,
  handleItemChange,
  handleItemColorChange,
  onDragEnd,
  onDelete, // receives an index to delete
  readOnly = false
}) {
  const itemsByColor = React.useMemo(() => {
    return generatedItems.reduce((acc, item, idx) => {
      const cid = item.colorId ?? "no-color";
      if (!acc[cid]) acc[cid] = [];
      acc[cid].push({ ...item, __idx: idx });
      return acc;
    }, {});
  }, [generatedItems]);
  const handleBeforeCapture = () => {
    document.body.style.overflow = "hidden";
  };

  const handleDragEnd = (result) => {
    document.body.style.overflow = "";
    if (!readOnly) onDragEnd(result);
  };

  return (
    <DragDropContext
      onBeforeCapture={handleBeforeCapture}
      onDragEnd={handleDragEnd}
    >
      <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}>
        {/* No Color bucket */}
        <Droppable droppableId="no-color">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="mb-3"
              style={{
                backgroundColor: snapshot.isDraggingOver ? "#e6f3ff" : "white",
                padding: 8,
                border: "1px solid #ddd",
                borderRadius: 4
              }}
            >
              <div
                onClick={() => toggleColor("no-color")}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <IonIcon
                  icon={
                    collapsedColors["no-color"] ? chevronForward : chevronDown
                  }
                />
                <strong style={{ marginLeft: 6 }}>No Color</strong>
              </div>

              {!collapsedColors["no-color"] &&
                (itemsByColor["no-color"] || []).map(
                  ({ __idx, ...itm }, index) => (
                    <Draggable
                      key={__idx}
                      draggableId={String(__idx)}
                      index={index}
                      isDragDisabled={readOnly}
                    >
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          style={{
                            ...prov.draggableProps.style,
                            // padding: 8,
                            margin: "4px 0",
                            backgroundColor: snap.isDragging
                              ? "#f0f9ff"
                              : "#fff",
                            border: "1px solid #ddd",
                            borderRadius: 4
                          }}
                        >
                          <Item
                            Item={itm}
                            index={__idx} // pa
                            readOnly={readOnly} // 👈 hiányzott
                            onItemChange={(upd) =>
                              !readOnly && handleItemChange(__idx, upd)
                            }
                            onDelete={() => !readOnly && onDelete(__idx)} // delete callback // delete callback
                          />
                        </div>
                      )}
                    </Draggable>
                  )
                )}

              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Color buckets */}
        {palette.map((color) => {
          const cid = String(color.colorId);
          const isCollapsed = !!collapsedColors[cid];

          return (
            <Droppable key={cid} droppableId={cid}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="mb-3"
                  style={{
                    backgroundColor: snapshot.isDraggingOver
                      ? "#e6f3ff"
                      : "white",
                    padding: 8,
                    border: "1px solid #ddd",
                    borderRadius: 4
                  }}
                >
                  <div
                    onClick={() => toggleColor(cid)}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <IonIcon
                      icon={isCollapsed ? chevronForward : chevronDown}
                    />
                    <strong style={{ marginLeft: 6 }}>{color.name}</strong>
                  </div>

                  {!isCollapsed &&
                    (itemsByColor[cid] || []).map(
                      ({ __idx, ...itm }, index) => (
                        <Draggable
                          key={__idx}
                          draggableId={String(__idx)}
                          index={index}
                          isDragDisabled={readOnly}
                        >
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              style={{
                                ...prov.draggableProps.style,
                                padding: 8,
                                margin: "4px 0",
                                backgroundColor: snap.isDragging
                                  ? "#f0f9ff"
                                  : "#fff",
                                border: "1px solid #ddd",
                                borderRadius: 4
                              }}
                            >
                              <Item
                                Item={itm}
                                index={__idx}
                                readOnly={readOnly}
                                onItemChange={(upd) =>
                                  !readOnly && handleItemChange(__idx, upd)
                                }
                                onDelete={() => !readOnly && onDelete(__idx)}
                              />
                            </div>
                          )}
                        </Draggable>
                      )
                    )}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
