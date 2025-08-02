// src/modules/helpers/GeneratedItemsList.js
import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { IonIcon } from "@ionic/react";
import { chevronDown, chevronForward } from "ionicons/icons";
import Item from "./item.js";

export default function GeneratedItemsList({
  calledFrom,
  onRegenerate,
  generatedItems,
  palette,
  collapsedColors,
  toggleColor,
  handleItemChange,
  handleItemColorChange,
  onDragEnd,
  onDelete, // receives an index to delete
  readOnly = false,
  objects = [],
  onSwap,
  hiddenItems,
  onToggleVisibility
}) {
  const itemsByColor = React.useMemo(() => {
    return generatedItems.reduce((acc, item, idx) => {
      const cid =
        item.color?.colorId != null ? String(item.color.colorId) : "no-color";
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
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
                {calledFrom == 1 ? (
                  <button
                    style={{
                      border: "none",
                      background: "none",
                      color: "#0d6efd",
                      cursor: "pointer",
                      padding: "0.25rem"
                    }}
                    onClick={() => onSwap(null)}
                  >
                    Szín hozzáadás
                  </button>
                ) : (
                  <></>
                )}
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
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: 8,
                            padding: "0 4px"
                          }}
                        >
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
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem"
                            }}
                          >
                            {onRegenerate && !readOnly && (
                              <button
                                style={{
                                  border: "none",
                                  background: "none",
                                  color: "#0d6efd",
                                  cursor: "pointer",
                                  padding: "0.25rem"
                                }}
                                onClick={() => onRegenerate(obj)}
                              >
                                Újragenerálás
                              </button>
                            )}
                          </div>
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
                                    paddingLeft: "1rem", // behúzás a fához
                                    backgroundColor: snap.isDragging
                                      ? "#f0f9ff"
                                      : "#fff",
                                    border: "1px solid #ddd",
                                    borderRadius: 4
                                  }}
                                >
                                  <Item
                                    calledFrom={calledFrom}
                                    Item={itm}
                                    index={__idx}
                                    readOnly={readOnly}
                                    visible={
                                      hiddenItems
                                        ? !hiddenItems.has(itm.itemId)
                                        : []
                                    }
                                    onToggleVisibility={() => {
                                      console.log(
                                        "generatedItemslist, toggle visible: ",
                                        itm.itemId
                                      );
                                      onToggleVisibility(itm.itemId);
                                    }}
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
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <IonIcon
                        icon={isCollapsed ? chevronForward : chevronDown}
                      />
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        {color.imageDataReduced ? (
                          <img
                            src={`data:image/jpeg;base64,${color.imageDataReduced}`}
                            alt={color.name}
                            style={{ width: 16, height: 16, borderRadius: 2 }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              backgroundColor: color.hex || "#ddd",
                              borderRadius: 2
                            }}
                          />
                        )}
                        <strong>{color.name}</strong>
                      </div>
                    </div>
                    {calledFrom == 1 ? (
                      <button
                        style={{
                          border: "none",
                          background: "none",
                          color: "#0d6efd",
                          cursor: "pointer",
                          padding: "0.25rem"
                        }}
                        onClick={() => onSwap(color.colorId)}
                      >
                        Csere
                      </button>
                    ) : (
                      <></>
                    )}
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
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginTop: 8,
                              padding: "0 4px"
                            }}
                          >
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

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem"
                              }}
                            >
                              {onRegenerate && !readOnly && (
                                <button
                                  style={{
                                    border: "none",
                                    background: "none",
                                    color: "#0d6efd",
                                    cursor: "pointer",
                                    padding: "0.25rem"
                                  }}
                                  onClick={() => onRegenerate(obj)}
                                >
                                  Újragenerálás
                                </button>
                              )}
                            </div>
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
                                      calledFrom={calledFrom}
                                      Item={itm}
                                      index={__idx}
                                      readOnly={readOnly}
                                      {...(!readOnly
                                        ? {
                                            visible: hiddenItems
                                              ? !hiddenItems.has(itm.itemId)
                                              : [],
                                            onToggleVisibility: () =>
                                              onToggleVisibility(itm.itemId)
                                          }
                                        : {})}
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
