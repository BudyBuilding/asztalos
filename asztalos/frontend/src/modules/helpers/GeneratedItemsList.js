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
  readOnly = false,
  objects = []
}) {
  /*
  const itemsByColor = React.useMemo(() => {
    return generatedItems.reduce((acc, item, idx) => {
      const cid = item.colorId ?? "no-color";
      if (!acc[cid]) acc[cid] = [];
      acc[cid].push({ ...item, __idx: idx });
      return acc;
    }, {});
  }, [generatedItems]);*/

  const itemsByColor = React.useMemo(() => {
    return generatedItems.reduce((acc, item, idx) => {
      const cid = item.colorId != null ? String(item.colorId) : "no-color";
      acc[cid] = acc[cid] || {};

      const oid =
        item.object?.objectId != null
          ? String(item.object.objectId)
          : "no-object";
      acc[cid][oid] = acc[cid][oid] || [];

      acc[cid][oid].push({ ...item, __idx: idx });
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

  const [collapsedObjects, setCollapsedObjects] = React.useState({});
  const toggleObject = (cid, oid) => {
    const key = `${cid}_${oid}`;
    setCollapsedObjects((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div /*style={{ overflowY: "auto", maxHeight: "78vh" }}*/>
      <DragDropContext
        onBeforeCapture={handleBeforeCapture}
        onDragEnd={handleDragEnd}
      >
        {/* No‐color bucket, object‐grouped */}
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
                <strong style={{ marginLeft: 6 }}>Nincs szín</strong>
              </div>

              {/* Objektumonként csoportosítva */}
              {!collapsedColors["no-color"] &&
                Object.entries(itemsByColor["no-color"] || {}).map(
                  ([oid, items]) => {
                    const key = `no-color_${oid}`;
                    const obj = objects.find((o) => String(o.objectId) === oid);
                    return (
                      <div key={oid} style={{ marginTop: 8 }}>
                        {/* kattintható fejléc */}
                        <div
                          onClick={() => toggleObject("no-color", oid)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer"
                          }}
                        >
                          <IonIcon
                            icon={
                              collapsedObjects[key]
                                ? chevronForward
                                : chevronDown
                            }
                          />
                          <strong style={{ marginLeft: 6 }}>
                            {obj ? `#${oid} ${obj.name}` : `Obj #${oid}`}
                          </strong>
                        </div>
                        {/* ha nincs összecsukva, jöhetnek az elemek */}
                        {!collapsedObjects[key] &&
                          items.map(({ __idx, ...itm }, idx) => (
                            <Draggable
                              key={__idx}
                              draggableId={String(__idx)}
                              index={idx}
                              isDragDisabled={readOnly}
                            >
                              {(prov, snap) => (
                                <div
                                  ref={prov.innerRef}
                                  {...prov.draggableProps}
                                  {...prov.dragHandleProps}
                                  style={{
                                    ...prov.draggableProps.style,
                                    margin: "4px 0",
                                    paddingLeft: "1rem", // behúzás a fához
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
                                    onDelete={() =>
                                      !readOnly && onDelete(__idx)
                                    }
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                      </div>
                    );
                  }
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

                  {!collapsedColors[cid] &&
                    itemsByColor[cid] &&
                    Object.entries(itemsByColor[cid]).map(([oid, items]) => {
                      const key = `${cid}_${oid}`;
                      const obj = objects.find(
                        (o) => String(o.objectId) === oid
                      );
                      return (
                        <div key={oid} style={{ marginTop: 8 }}>
                          <div
                            onClick={() => toggleObject(cid, oid)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer"
                            }}
                          >
                            <IonIcon
                              icon={
                                collapsedObjects[key]
                                  ? chevronForward
                                  : chevronDown
                              }
                            />
                            <strong style={{ marginLeft: 6 }}>
                              {obj ? `#${oid} ${obj.name}` : `Obj #${oid}`}
                            </strong>
                          </div>
                          {!collapsedObjects[key] &&
                            items.map(({ __idx, ...itm }, idx) => (
                              <Draggable
                                key={__idx}
                                draggableId={String(__idx)}
                                index={idx}
                                isDragDisabled={readOnly}
                              >
                                {(prov, snap) => (
                                  <div
                                    ref={prov.innerRef}
                                    {...prov.draggableProps}
                                    {...prov.dragHandleProps}
                                    style={{
                                      ...prov.draggableProps.style,
                                      margin: "4px 0",
                                      paddingLeft: "1rem", // behúzás
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
                                        !readOnly &&
                                        handleItemChange(__idx, upd)
                                      }
                                      onDelete={() =>
                                        !readOnly && onDelete(__idx)
                                      }
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                        </div>
                      );
                    })}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </DragDropContext>
    </div>
  );
}
