import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCreatedTablesByWork,
  getCreatedItemsByWork,
  getAllObjects,
  getImageById,
  getUserByWorkId,
  getWorkById,
  getAllColors,
  getAllWorks,
  getColorById
} from "../../data/getters";
import html2canvas from "html2canvas";
import {
  updateTables,
  updateItems
} from "../../data/store/actions/objectStoreFunctions";
import createdTablesApi from "../../data/api/createdTablesApi";
import createdItemApi from "../../data/api/createdItemApi";
import { useParams } from "react-router-dom";
import Loading from "../helpers/Loading";
import Item from "../helpers/item";
import GeneratedItemsList from "../helpers/GeneratedItemsList";
import { jsPDF } from "jspdf";
import { IonIcon } from "@ionic/react";
import { reload, removeCircleOutline } from "ionicons/icons";
import { Button } from "react-bootstrap";
import {
  parsePositions,
  generateDiagonalLines,
  getTablePositions,
  findFreePosition,
  checkCollisionAndSnap,
  makeInstanceIds,
  groupByColor
} from "../../modules/helpers/tableViewerUtil";

//  import "jspdf-svg";
import store from "../../data/store/store";
const TableViewer = () => {
  const dispatch = useDispatch();
  const { workId } = useParams();

  const [createdTables, setCreatedTables] = useState([]);
  const [createdItems, setCreatedItems] = useState([]);
  const [processedItems, setProcessedItems] = useState([]);
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const [dividerPosition, setDividerPosition] = useState(75);
  const [selectedItemPosition, setSelectedItemPosition] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTables, setEditedTables] = useState([]);
  const [editedItems, setEditedItems] = useState([]);
  const [showNoTableText, setShowNoTableText] = useState(false);
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedColorId, setSelectedColorId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [collapsedColors, setCollapsedColors] = useState({});
  const colorsFromStore = dispatch(dispatch(getAllColors)) || {};

  const [objects, setObjects] = useState([]);
  useEffect(() => {
    const allObjects = dispatch(getAllObjects());
    setObjects(allObjects.filter((o) => o.work?.workId === +workId));
  }, [workId]);

  const colors = Array.isArray(colorsFromStore)
    ? colorsFromStore
    : Object.values(colorsFromStore);

  const [palette, setPalette] = useState([]);

  const currentUser = useSelector((state) => state.auth.user);
  useEffect(() => {
    const itemColorIds = Array.from(
      new Set(
        createdItems.map((it) => it.color?.colorId).filter((cid) => cid != null)
      )
    );
    setPalette((prev) => {
      const allIds = Array.from(
        new Set([...prev.map((c) => c.colorId), ...itemColorIds])
      );
      return allIds
        .map((id) => colors.find((c) => c.colorId === id))
        .filter(Boolean);
    });
  }, [createdItems, colors]);

  const allWorks = dispatch(getAllWorks());
  const selectedWork = allWorks.find((w) => w.workId == workId);
  const isOrdered = selectedWork?.isOrdered;

  const cannotEdit =
    (currentUser.role === "user" && isOrdered) ||
    ((currentUser.role === "companyAdmin" ||
      currentUser.role === "companyUser") &&
      selectedWork?.companyStatus === "Completed") ||
    ((currentUser.role === "companyAdmin" ||
      currentUser.role === "companyUser") &&
      !isOrdered);
  const canEdit = !cannotEdit;

  // tétel frissítése (index + partial-update mezők)
  const handleCreatedItemChange = (index, fields) => {
    setCreatedItems((prev) => {
      const arr = [...prev];
      arr[index] = { ...arr[index], ...fields };
      const updated = arr[index];
      // ha már mentett tétel, akkor api-hívás
      if (typeof updated.itemId === "number" && updated.itemId > 0) {
        const payload = {
          ...updated,
          ...(fields.colorId !== undefined && {
            color: fields.colorId === null ? null : { colorId: fields.colorId }
          })
        };
        delete payload.colorId;
        dispatch(
          createdItemApi.updateCreatedItemApi(updated.itemId, payload)
        ).catch((err) => console.error("Error updating createdItem:", err));
      }
      return arr;
    });
  };

  // tétel törlése (index alapján)
  const handleDeleteItem = (index) => {
    const item = createdItems[index];
    if (item.itemId && item.itemId > 0) {
      dispatch(createdItemApi.deleteCreatedItemApi(item.itemId))
        .then(() => {
          setCreatedItems((prev) => prev.filter((_, i) => i !== index));
        })
        .catch((err) => console.error("Error deleting createdItem:", err));
    } else {
      // még nem mentett, csak lokális tétel
      setCreatedItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const tables1 = await createdTablesApi.getAllCreatedTablesForWorkApi(
        workId
      );
      const tables = tables1.map((t) => ({ ...t, id: t.tableId }));
      const rawItems = await createdItemApi.getAllCreatedItemsForWorkApi(
        workId
      );

      const items = rawItems.map((it) => ({
        ...it,
        colorId: it.color?.colorId ?? null
      }));

      setCreatedTables(tables);
      setCreatedItems(items);

      const processed = items.map((item) => {
        const positions = parsePositions(item.tablePosition);
        const [origH, origW] = JSON.parse(item.size || "[0,0]");
        const instanceIds = makeInstanceIds(item.itemId, item.qty);
        return {
          ...item,
          processedPositions: positions.map(
            ([x, y, rotation, tableId], idx) => {
              const isHorizontal = rotation == 1;
              const width = isHorizontal ? origH : origW;
              const height = isHorizontal ? origW : origH;
              const instanceId = instanceIds[idx];
              return { instanceId, x, y, rotation, tableId, width, height };
            }
          )
        };
      });
      setProcessedItems(processed);
      setShowNoTableText(tables.length == 0);
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => {
    setCurrentTableIndex(0);
  }, [selectedColorId]);

  const handleGenerateTables = async () => {
    const work_Id = parseInt(workId, 10);
    try {
      await createdTablesApi.generateTablesApi(work_Id);
      await loadData();
      setCurrentTableIndex(0);
      setShowNoTableText(false);
    } catch (error) {
      console.error("Nem sikerült a táblák generálása:", error);
    }
  };

  useEffect(() => {
    loadData();
    setCurrentTableIndex(0);
    setShowNoTableText(false);

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [dispatch, workId]);

  // TableViewer komponensen belül
  const handleAddItem = async () => {
    const defaultObjectId = objects[0].objectId;
    const payload = {
      size: "[1,1,18]",
      qty: 1,
      position: "[0,0,0]",
      rotation: "[0,0,0]",
      colorId: null,
      name: "",
      details: "",
      material: "", // anyag
      rotable: true,
      object: { objectId: +defaultObjectId },
      work: { workId: +workId }, // ← ide kell a munka
      itemId: Date.now() * -1
    };

    try {
      // 2) Hívd meg a create API-t
      const created = await dispatch(
        createdItemApi.createCreatedItemApi(payload)
      );
      setCreatedItems((prev) => [
        ...prev,
        { ...created, colorId: created.color?.colorId ?? null }
      ]);

      setEditedItems((prev) => [
        ...prev,
        {
          ...created,
          processedPositions: []
        }
      ]);

      setProcessedItems((prev) => [
        ...prev,
        {
          ...created,
          processedPositions: []
        }
      ]);
    } catch (err) {
      console.error("Hiba történt az új tétel mentésekor:", err);
      alert("Nem sikerült új itemet hozzáadni, kérlek próbáld újra.");
    }
  };

  const filteredTables = selectedColorId
    ? createdTables.filter((t) => t.color?.colorId === selectedColorId)
    : createdTables;

  const currentTable =
    filteredTables.length > 0
      ? filteredTables[currentTableIndex % filteredTables.length]
      : null;

  const handleNextTable = () => {
    setCurrentTableIndex((prev) => (prev + 1) % filteredTables.length);
  };

  const handlePrevTable = () => {
    setCurrentTableIndex(
      (i) => (i - 1 + filteredTables.length) % filteredTables.length
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
        position: "relative"
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: `${dividerPosition}%`,
          position: "relative",
          overflow: "hidden"
        }}
      >
        <TableViewerComponent
          onGenerate={handleGenerateTables}
          workId={workId}
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
          isLoading={isLoading}
          selectedColorId={selectedColorId}
          setSelectedColorId={setSelectedColorId}
          createdTables={createdTables}
          isExporting={isExporting}
          setIsExporting={setIsExporting}
          processedItems={processedItems}
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
          zIndex: 10
        }}
      />

      <div
        style={{
          width: `${100 - dividerPosition}%`,
          overflowY: "auto",
          overflowX: "hidden"
        }}
      >
        <div
          style={{
            maxHeight: "90vh",
            paddingLeft: "1rem"
          }}
        >
          <h3 className="mt-4 d-flex align-items-center">
            Elemek
            {canEdit && (
              <Button
                size="sm"
                variant="outline-primary"
                className="ms-2"
                onClick={handleAddItem}
              >
                Elem hozzáadása
              </Button>
            )}
          </h3>
          <div
            style={{
              overflowY: "auto",
              maxHeight: "85vh"
            }}
          >
            <GeneratedItemsList
              generatedItems={createdItems}
              palette={palette}
              collapsedColors={collapsedColors}
              toggleColor={(cid) =>
                setCollapsedColors((cc) => ({ ...cc, [cid]: !cc[cid] }))
              }
              readOnly={isOrdered}
              handleItemChange={(idx, updatedFields) =>
                handleCreatedItemChange(idx, updatedFields)
              }
              handleItemColorChange={(idx, color) =>
                handleCreatedItemChange(idx, { colorId: color.colorId })
              }
              onDragEnd={(result) => {
                const { destination, draggableId } = result;
                if (!destination) return;
                const idx = Number(draggableId);
                const newCid =
                  destination.droppableId === "no-color"
                    ? null
                    : Number(destination.droppableId);
                handleCreatedItemChange(idx, { colorId: newCid });
              }}
              onDelete={handleDeleteItem}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const TableViewerComponent = ({
  onGenerate,
  workId,
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
  isLoading,
  selectedColorId,
  setSelectedColorId,
  createdTables,
  setIsExporting,
  isExporting,
  processedItems
}) => {
  const dispatch = useDispatch();
  const [scaleFactor, setScaleFactor] = useState(1);
  const [selectedDimension, setSelectedDimension] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const BORDER_WIDTH = 2;
  const drawingRef = useRef(null);
  //const [tableHeight, tableWidth] = JSON.parse(table.size || "[0,0]");
  const bgImageBase64 = dispatch(
    getColorById(table?.color?.colorId)
  )?.imageData;
  const [tableInstances, setTableInstances] = useState([]);
  const { workIdParam } = useParams();
  const showNav = createdTables.length > 1;
  const allWorks = dispatch(getAllWorks());
  const selectedWork = allWorks.find((w) => w.workId == workId);
  const isOrdered = selectedWork?.isOrdered;

  const currentUser = useSelector((state) => state.auth.user);

  const cannotEdit =
    (currentUser.role === "user" && isOrdered) ||
    ((currentUser.role === "companyAdmin" ||
      currentUser.role === "companyUser") &&
      selectedWork?.companyStatus === "Completed") ||
    ((currentUser.role === "companyAdmin" ||
      currentUser.role === "companyUser") &&
      !isOrdered);
  const canEdit = !cannotEdit;

  const backgroundImageStyle = bgImageBase64
    ? `url(data:image/jpeg;base64,${bgImageBase64})`
    : "none";

  useEffect(() => {
    if (!table) {
      setTableInstances([]);
      return;
    }
    // az épp látható (edited vagy processed) itemsből kigyűjtjük az összes pozíciót erre a táblára
    const source = isEditing ? editedItems : processedItems;
    const poses = getTablePositions(source, table.id);
  }, [table, isEditing, editedItems, processedItems]);

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

  const colors = useSelector((state) => state.colors); // vagy ahová bemented

  useEffect(() => {
    dispatch(getAllColors());
  }, [dispatch]);

  const handleExportPdf = async () => {
    const totalStart = performance.now();
    setIsExporting(true);

    try {
      if (!createdTables.length) {
        alert("Nincs exportálható tábla. Kérlek, generálj táblákat először.");
        return;
      }

      const work = dispatch(getWorkById(workId));
      let user = (work?.user?.name || "Unknown_User").replace(/\s+/g, "_");

      // Csoportosítás szín szerint
      const byColor = createdTables.reduce((acc, tbl) => {
        const cid = tbl.color?.colorId ?? "__NO_COLOR__";
        (acc[cid] = acc[cid] || []).push(tbl);
        return acc;
      }, {});

      for (const [cid, tables] of Object.entries(byColor)) {
        let colorName = tables[0]?.color?.name || "no_color";
        const colorStart = performance.now();

        const pdf = new jsPDF({ orientation: "landscape", unit: "px" });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < tables.length; i++) {
          const tbl = tables[i];
          setCurrentTableIndex(createdTables.indexOf(tbl));
          await new Promise((r) => setTimeout(r, 50));

          // Canvas fehér háttérrel
          const origBg = drawingRef.current.style.backgroundImage;
          drawingRef.current.style.backgroundImage = "none";
          const canvas = await html2canvas(drawingRef.current, {
            backgroundColor: "#fff"
          });
          drawingRef.current.style.backgroundImage = origBg;

          const imgData = canvas.toDataURL("image/png");
          const ratio =
            Math.min(pageW / canvas.width, pageH / canvas.height) * 0.8;
          const x = (pageW - canvas.width * ratio) / 2;
          const y = (pageH - canvas.height * ratio) / 2;

          if (i > 0) pdf.addPage();

          // Felirat minden oldalon, egymás alá
          pdf.setFontSize(16);
          pdf.setTextColor(0);
          pdf.text(
            [
              `Felhasználó: ${user}`,
              `Munka: ${workId}`,
              `Szín: ${colorName}`,
              `Azonosító: ${tbl.id}`
            ],
            10,
            12
          );

          // Kép beszúrása
          pdf.addImage(
            imgData,
            "PNG",
            x,
            y,
            canvas.width * ratio,
            canvas.height * ratio
          );
        }

        user = user.replace(/\s+/g, "_");
        colorName = colorName.replace(/\s+/g, "_");
        pdf.save(`${user}_${colorName}_${workId}.pdf`);
      }
    } catch (err) {
      console.error("🚨 Export error:", err);
      alert("Hiba történt a PDF exportálás során.");
    } finally {
      setIsExporting(false);
    }
  };

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
          position: "relative"
        }}
      >
        <p>There is no table, please add one</p>
        <button
          onClick={onGenerate}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "8px 16px",
            fontSize: "14px",
            cursor: "pointer",
            backgroundColor: "#9E9E9E",
            color: "white",
            border: "none",
            borderRadius: "12px"
          }}
        >
          Generate Tables
        </button>
      </div>
    );
  }

  if (isLoading) return <Loading />;
  const [height = 0, width = 0, thickness = 0] = JSON.parse(
    table.size || "[0,0,0]"
  );
  const colorName = table.color?.name || "N/A";

  const parsePositions = (tablePosition) => {
    if (!tablePosition) return [];
    return tablePosition
      .replace(/\]\[/g, "],[")
      .split("],[")
      .map((pos) => pos.replace(/\[|\]/g, "").split(",").map(Number));
  };

  const generateDiagonalLines = () => {
    const scaledWidth = width * scaleFactor;
    const scaledHeight = height * scaleFactor;
    const lineSpacing = 10;
    const angle = 35 * (Math.PI / 180);
    const diagonalLength = Math.sqrt(
      scaledWidth * scaledWidth + scaledHeight * scaledHeight
    );
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

  const handleAddTable = async () => {
    const colorObj =
      colors.find((c) => c.colorId == table.color.colorId) || null;
    if (!colorObj) return;
    const payload = {
      work: { workId: workId },
      price: colorObj.price,
      size: colorObj.dimension,
      color: colorObj
    };

    try {
      // 2) POST a backendre
      const created = await dispatch(
        createdTablesApi.createCreatedTablesApi(payload)
      );
      // 3) update local state
      const newList = [...editedTables, created];
      console.log("New table created:", newList);
      setEditedTables(newList);
      setCreatedTables(newList);
      setCurrentTableIndex(newList.length - 1);

      // 4) ha most lett először táblád, engedélyezd az edit módot
      if (newList.length === 1 && !isEditing) {
        setIsEditing(true);
        setShowNoTableText(false);
        // dispatch(updateTables(newList));
      }
    } catch (err) {
      console.error("Add Table failed:", err);
      alert("Nem sikerült új táblát hozzáadni.");
    }
  };

  const handleDeleteTable = () => {
    const confirmDelete = window.confirm(
      "Biztosan törölni szeretnéd ezt a táblát és az ahhoz tartozó itemeket?"
    );
    if (confirmDelete) {
      const tableIdToDelete = table.id;
      const newEditedTables = editedTables.filter(
        (t) => t.id !== tableIdToDelete
      );
      const newEditedItems = editedItems.filter((item) => {
        const positions = parsePositions(item.tablePosition);
        return !positions.some((position) => {
          const [, , , tableId] = position;
          return tableId == tableIdToDelete;
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
    const confirmSave = window.confirm(
      "Biztosan menteni szeretnéd a változtatásokat?"
    );
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

  const positionsForTable = (item, tableId = table.id) =>
    (item.processedPositions || []).filter((p) => p.tableId == tableId);

  const filteredItems = items.filter(
    (item) => positionsForTable(item, table.id).length > 0
  );

  async function handleRotateItem() {
    if (!selectedItemPosition) return;
    const { itemId, instanceId } = selectedItemPosition;
    const item = editedItems.find((i) => i.itemId === itemId);
    if (!item) return;

    const pos = item.processedPositions.find(
      (p) => p.instanceId === instanceId
    );
    let { x, y, rotation } = pos;
    const [origW, origH] = JSON.parse(item.size || "[0,0]");
    const newRot = rotation === 0 ? 1 : 0;
    const w = newRot ? origH : origW;
    const h = newRot ? origW : origH;
    const [tableH, tableW] = JSON.parse(table.size || "[0,0]");
    const allPoses = getTablePositions(editedItems, table.id);

    // bounds és collision
    if (
      x + w > tableW ||
      y + h > tableH ||
      allPoses.some(
        (p) =>
          p.instanceId !== instanceId &&
          x < p.x + p.width &&
          x + w > p.x &&
          y < p.y + p.height &&
          y + h > p.y
      )
    ) {
      const free = findFreePosition(w, h, instanceId, tableW, tableH, allPoses);
      if (!free) return alert("Forgatás nem lehetséges.");
      x = free.x;
      y = free.y;
    }

    // apply
    setEditedItems((cur) =>
      cur.map((it) =>
        it.itemId === itemId
          ? {
              ...it,
              processedPositions: it.processedPositions.map((p) =>
                p.instanceId === instanceId
                  ? { ...p, x, y, rotation: newRot, width: w, height: h }
                  : p
              )
            }
          : it
      )
    );
  }

  const getTablePositions = (items, tableId) =>
    items.flatMap((item) =>
      item.processedPositions.filter((p) => {
        return p.tableId === tableId;
      })
    );

  // Régi szignatúra: handleItemMouseDown(e, item, instanceIdx)
  const handleItemMouseDown = (e, item, instanceId) => {
    if (!isEditing) return;
    e.preventDefault();

    // Keresd meg a pozíciót a pontos instanceId alapján
    const pos = item.processedPositions.find(
      (p) => p.instanceId === instanceId
    );
    if (!pos) {
      console.warn(
        `Instance not found: ${instanceId}`,
        item.processedPositions
      );
      return;
    }
    let { x: startX, y: startY, width: w, height: h } = pos;

    // utolsó ütközésmentes
    let lastValid = { x: startX, y: startY };

    const [tableH, tableW] = JSON.parse(table.size || "[0,0]");

    const onMouseMove = (me) => {
      const dx = (me.clientX - e.clientX) / scaleFactor;
      const dy = (me.clientY - e.clientY) / scaleFactor;
      const rawX = startX + dx;
      const rawY = startY + dy;
      const boundedX = Math.max(0, Math.min(rawX, tableW - w));
      const boundedY = Math.max(0, Math.min(rawY, tableH - h));

      const others = getTablePositions(editedItems, table.id).filter(
        (p) => p.instanceId !== instanceId
      );

      // Debug: írasd ki, mi történik
      console.group(`Dragging ${instanceId}`);
      console.groupEnd();

      const isColliding = others.some(
        (p) =>
          boundedX < p.x + p.width &&
          boundedX + w > p.x &&
          boundedY < p.y + p.height &&
          boundedY + h > p.y
      );

      let finalX = isColliding ? lastValid.x : boundedX;
      let finalY = isColliding ? lastValid.y : boundedY;
      if (!isColliding) lastValid = { x: finalX, y: finalY };

      setEditedItems((cur) =>
        cur.map((it) =>
          it.itemId === item.itemId
            ? {
                ...it,
                processedPositions: it.processedPositions.map((p) =>
                  p.instanceId === instanceId
                    ? { ...p, x: finalX, y: finalY }
                    : p
                )
              }
            : it
        )
      );
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleMoveToTable = (targetTableId) => {
    if (!selectedItemPosition || !isEditing) return;

    const { itemId, instanceId } = selectedItemPosition;
    const selectedItem = editedItems.find((it) => it.itemId == itemId);
    if (!selectedItem) return;

    // processedPositions-ben megkeressük a mozgó elem indexét
    const posIdx = selectedItem.processedPositions.findIndex(
      (p) => p.instanceId === instanceId
    );
    if (posIdx < 0) return;

    // ebből a pozícióból olvassuk ki a koordinátákat
    const positionToMove = selectedItem.processedPositions[posIdx];
    const { x, y, rotation } = positionToMove;
    const isHorizontal = rotation === 1;

    const [origW, origH] = JSON.parse(selectedItem.size || "[0,0]");
    const itemWidth = isHorizontal ? origH : origW;
    const itemHeight = isHorizontal ? origW : origH;

    // cél tábla mérete
    const targetTable = editedTables.find((t) => t.id === targetTableId);
    if (!targetTable) return;
    const [targetH, targetW] = JSON.parse(targetTable.size || "[0,0]");

    // szabad pozíció keresése
    const others = editedItems
      .flatMap((it) => it.processedPositions)
      .filter(
        (p) => p.tableId === targetTableId && p.instanceId !== instanceId
      );
    const free = findFreePosition(
      itemWidth,
      itemHeight,
      instanceId,
      targetW,
      targetH,
      others
    );
    const [newX, newY] = free ? [free.x, free.y] : [0, 0];
    const newPos = {
      x: newX,
      y: newY,
      rotation,
      tableId: targetTableId,
      width: itemWidth,
      height: itemHeight,
      instanceId
    };

    // 1) töröljük az eredetit az eredeti táblából
    let updated = { ...selectedItem };
    updated.processedPositions = updated.processedPositions.filter(
      (p) => p.instanceId !== instanceId
    );

    // 2) hozzáadjuk az új pozíciót
    updated.processedPositions.push(newPos);

    // 3) frissítjük a tablePosition stringet is
    updated.tablePosition = updated.processedPositions
      .map((p) => `[${p.x},${p.y},${p.rotation},${p.tableId}]`)
      .join("");

    // 4) cseréljük a listában
    const newItems = editedItems.map((it) =>
      it.itemId === itemId ? updated : it
    );

    setEditedItems(newItems);
    setSelectedItemPosition(null);
    setShowDropdown(false);

    // végül navigálunk az új táblára
    const newIndex = editedTables.findIndex((t) => t.id === targetTableId);
    setCurrentTableIndex(newIndex);
  };

  return (
    <div style={{ padding: "20px", position: "relative", textAlign: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {showNav && (
          <button onClick={onPrev} style={buttonStyle}>
            {"<"}
          </button>
        )}
        <h2 style={{ margin: "0 20px" }}>
          Tábla azonosító:{" "}
          {table ? table.id || "Unknown ID" : "No Table Selected"}
        </h2>
        {showNav && (
          <button onClick={onNext} style={buttonStyle}>
            {">"}
          </button>
        )}
      </div>
      <div style={{ margin: "10px auto", width: "200px", textAlign: "left" }}>
        <select
          value={selectedColorId ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedColorId(val ? Number(val) : null);
          }}
          style={{
            width: "100%",
            padding: "6px",
            fontSize: "14px",
            borderRadius: "4px",
            border: "1px solid #ccc"
          }}
        >
          <option value="0">Összes szín</option>
          {[
            ...new Set(
              createdTables.map((t) => t.color?.colorId).filter(Boolean)
            )
          ].map((cid) => {
            const name = createdTables.find((t) => t.color?.colorId === cid)
              .color.name;
            return (
              <option key={cid} value={cid}>
                {name}
              </option>
            );
          })}
        </select>
      </div>
      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
        {!isEditing && (
          <>
            <button
              onClick={handleExportPdf}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                cursor: "pointer",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "12px",
                marginRight: "8px"
              }}
            >
              Exportálás PDF-ként
            </button>
            {!cannotEdit ? (
              <button
                onClick={startEditing}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  cursor: "pointer",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  marginRight: "8px"
                }}
              >
                Tábla szerkesztése
              </button>
            ) : (
              <></>
            )}
          </>
        )}
        {!cannotEdit ? (
          <button
            onClick={onGenerate}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              cursor: "pointer",
              backgroundColor: "#9E9E9E",
              color: "white",
              border: "none",
              borderRadius: "12px"
            }}
          >
            Generálás
          </button>
        ) : (
          <></>
        )}
      </div>

      {isEditing && (
        <div
          style={{
            position: "absolute",
            /* push it below the Generate button */
            top: "60px",
            right: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            zIndex: 5 // keep it underneath if needed
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
              borderRadius: "12px"
            }}
          >
            Tábla hozzáadás
          </button>
          <button
            onClick={handleDeleteTable}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              cursor: "pointer",
              backgroundColor: "#F44336",
              color: "white",
              border: "none",
              borderRadius: "12px"
            }}
          >
            Tábla törlése
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
              borderRadius: "12px"
            }}
          >
            Mentés
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
              borderRadius: "12px"
            }}
          >
            Mégsem
          </button>
          {selectedItemPosition && (
            <>
              <button
                onClick={handleRotateItem}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  cursor: "pointer",
                  backgroundColor: "#FF9800",
                  color: "white",
                  border: "none",
                  borderRadius: "12px"
                }}
              >
                Forgatás
              </button>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    padding: "8px 16px",
                    fontSize: "14px",
                    cursor: "pointer",
                    backgroundColor: "#3F51B5",
                    color: "white",
                    border: "none",
                    borderRadius: "12px"
                  }}
                >
                  Áthelyezés a: {table.id} táblára
                </button>
                {showDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                      zIndex: 100
                    }}
                  >
                    {editedTables.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleMoveToTable(t.id)}
                        style={{
                          padding: "8px 16px",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee"
                        }}
                      >
                        Tábla: {t.id}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
      <>
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "50%", // igazítsd a kívánt pozícióra
            zIndex: 1000,
            background: "rgba(255,255,255,0.8)",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "bold"
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            top: `calc(50%  ${BORDER_WIDTH}px)`,
            left: "10px",
            transform: "translateY(-50%)",
            zIndex: 1000,
            background: "rgba(255,255,255,0.8)",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "bold",
            writingMode: "vertical-rl"
          }}
        ></div>
        <div
          ref={drawingRef}
          style={{
            width: `${width * scaleFactor}px`,
            height: `${height * scaleFactor}px`,
            position: "relative",
            margin: "0 auto",
            border: `${BORDER_WIDTH}px solid ${
              isEditing ? "#4CAF50" : "black"
            }`,
            boxSizing: "content-box",
            overflow: "hidden",
            backgroundImage: backgroundImageStyle,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat"
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
              zIndex: 1
            }}
            width={width * scaleFactor}
            height={height * scaleFactor}
          >
            <defs>
              <mask id="itemMask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {filteredItems.map((item) =>
                  (item.processedPositions || [])
                    .filter((pos) => pos.tableId === table.id)
                    .map((pos, index) => {
                      const {
                        x,
                        y,
                        rotation,
                        tableId,
                        width: itemWidth,
                        height: itemHeight
                      } = pos;

                      const scaledX = x * scaleFactor;
                      const scaledY = y * scaleFactor;
                      const scaledWidth = itemWidth * scaleFactor;
                      const scaledHeight = itemHeight * scaleFactor;
                      if (rotation == 1) {
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
                            transform={`rotate(90, ${
                              scaledX + scaledWidth / 2
                            }, ${scaledY + scaledHeight / 2})`}
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
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth="1"
                  style={{ mixBlendMode: "difference" }}
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
              fontWeight: "bold"
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
              transformOrigin: "center"
            }}
          >
            {height}
          </div>

          {filteredItems.map((item) => {
            return (item.processedPositions || [])
              .filter((pos) => pos.tableId === table.id)
              .map((pos, index) => {
                const {
                  x = 0,
                  y = 0,
                  rotation,
                  tableId,
                  width: itemWidth,
                  height: itemHeight
                } = pos;

                const positionKey = `${item.itemId}-${index}`;
                const isSelected =
                  selectedItemPosition?.itemId === item.itemId &&
                  selectedItemPosition?.instanceId === pos.instanceId;

                const dispWidth = rotation == 1 ? itemHeight : itemWidth;
                const dispHeight = rotation == 1 ? itemWidth : itemHeight;
                const isRotated = rotation == 1;
                const scaledX = x * scaleFactor;
                const scaledY = y * scaleFactor;
                const scaledWidth = itemWidth * scaleFactor;
                const scaledHeight = itemHeight * scaleFactor;

                let kantCode = "";
                let kantLenCount = 0,
                  kantWidCount = 0;
                if (Array.isArray(item.kant)) {
                  [kantCode, kantLenCount, kantWidCount] = item.kant;
                } else if (typeof item.kant === "string") {
                  // pl. "[04, 1, 0]" → ["04","1","0"]
                  const parts = item.kant
                    .replace(/^\[|\]$/g, "")
                    .split(",")
                    .map((s) => s.trim());
                  kantCode = parts[0] || "";
                  kantLenCount = parseInt(parts[1], 10) || 0;
                  kantWidCount = parseInt(parts[2], 10) || 0;
                }

                const kantMap = {
                  "": "-",
                  "04": "S",
                  2: "G",
                  42: "LAT",
                  1: "L"
                };
                const kantChar = kantMap[String(kantCode)] || "";
                const widthSuffix = kantChar.repeat(kantWidCount);
                const heightSuffix = kantChar.repeat(kantLenCount);

                let adjustedLeft = scaledX;
                let adjustedTop = scaledY;
                if (rotation == 1) {
                  const offsetX = (scaledHeight - scaledWidth) / 2;
                  const offsetY = (scaledWidth - scaledHeight) / 2;
                  adjustedLeft = scaledX - offsetX;
                  adjustedTop = scaledY - offsetY;
                }

                return (
                  <div
                    key={positionKey}
                    onMouseDown={(e) =>
                      handleItemMouseDown(e, item, pos.instanceId)
                    }
                    onClick={() => {
                      if (isSelected) {
                        setSelectedItemPosition(null);
                        setSelectedDimension(null);
                      } else {
                        setSelectedItemPosition({
                          itemId: item.itemId,
                          instanceId: pos.instanceId
                        });
                      }
                    }}
                    style={{
                      position: "absolute",
                      left: `${adjustedLeft}px`,
                      top: `${adjustedTop}px`,
                      width: `${rotation == 1 ? scaledHeight : scaledWidth}px`,
                      height: `${rotation == 1 ? scaledWidth : scaledHeight}px`,
                      backgroundColor: "transparent",
                      border: `1px solid ${isSelected ? "#87CEEB" : "black"}`,
                      boxSizing: "border-box",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 2,
                      cursor: isEditing ? "move" : "pointer",
                      transform:
                        rotation == 1 ? "rotate(90deg)" : "rotate(0deg)",
                      transformOrigin: "center"
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        textAlign: "center",
                        transform: `rotate(${isRotated ? -90 : 0}deg)`,
                        color: "#333"
                      }}
                    >
                      <span
                        style={{
                          border: "0.5px solid black",
                          borderRadius: "2px",
                          padding: "2px 4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#333",
                          marginBottom: "2px"
                        }}
                      >
                        {item.itemId}
                      </span>
                      <br />
                      {item.details}
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        //setSelectedItemPosition({ itemId: item.itemId, index });
                        setSelectedItemPosition({
                          itemId: item.itemId,
                          instanceId: pos.instanceId
                        });
                        setSelectedDimension("width");
                      }}
                      style={{
                        position: "absolute",
                        top: "0",
                        left: "50%",
                        color: "#333",
                        transform: `translateX(-50%) rotate(${
                          isRotated ? -90 : 0
                        }deg)`,
                        fontSize: "10px",
                        textAlign: "center",
                        fontWeight: "normal",
                        marginTop: "2px",
                        cursor: "pointer",
                        padding: "2px",
                        fontWeight: "bold",
                        border: `1px solid ${
                          isSelected && selectedDimension == "width"
                            ? "#87CEEB"
                            : "transparent"
                        }`
                      }}
                    >
                      {dispWidth}
                      <br />
                      {widthSuffix}
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
                        transform: `translateY(-50%) rotate(${
                          !isRotated ? 0 : -90
                        }deg)`,
                        fontSize: "10px",
                        fontWeight: "normal",
                        color: "#333",
                        cursor: "pointer",
                        padding: "2px",
                        fontWeight: "bold",
                        border: `1px solid ${
                          isSelected && selectedDimension == "height"
                            ? "#87CEEB"
                            : "transparent"
                        }`
                      }}
                    >
                      {dispHeight}
                      <br />
                      {heightSuffix}
                    </div>
                  </div>
                );
              });
          })}
        </div>
      </>
      {isExporting && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255,255,255,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999
          }}
        >
          <Loading />
        </div>
      )}
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
  textAlign: "center"
};

buttonStyle[":hover"] = {
  backgroundColor: "#ddd"
};

const ItemList = ({
  items,
  selectedItemPosition,
  setSelectedItemPosition,
  isEditing,
  onAddItem,
  onItemChange,
  onItemDelete,
  cannotEdit
}) => {
  const [selectedItemPositions, setSelectedItemPositions] = useState(null);

  const handleItemClick = (item) => {
    const positions = item.processedPositions || [];
    if (selectedItemPositions && selectedItemPositions.itemId == item.itemId) {
      setSelectedItemPositions(null);
      setSelectedItemPosition(null);
    } else {
      setSelectedItemPositions({ itemId: item.itemId, positions });
    }
  };

  const handlePositionClick = (itemId, index) => {
    const item = items.find((i) => i.itemId === itemId);
    const pos = item.processedPositions[index];
    setSelectedItemPosition({ itemId, instanceId: pos.instanceId });
  };

  function parseBracketString(str) {
    if (!str) return ["", "0", "0"];
    const parts = str
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim());
    return parts.length === 3 ? parts : ["", "0", "0"];
  }

  return (
    <div style={{ width: "100%", padding: "20px", paddingRight: "0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <h2 style={{ margin: 0 }}>Items</h2>
        {isEditing && onAddItem && cannotEdit && (
          <button
            onClick={onAddItem}
            style={{
              padding: "6px 12px",
              fontSize: "14px",
              cursor: "pointer",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px"
            }}
          >
            Add Item
          </button>
        )}
      </div>
      <div>
        {items.map((item, idx) => (
          <Item
            key={item.itemId}
            Item={item}
            readOnly={!isEditing}
            onItemChange={onItemChange}
            onDelete={() => onItemDelete(item.itemId)}
          />
        ))}
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
                selectedItemPosition.itemId == selectedItemPositions.itemId &&
                selectedItemPosition.index == index;
              return (
                <div
                  key={positionKey}
                  onClick={() =>
                    handlePositionClick(selectedItemPositions.itemId, index)
                  }
                  style={{
                    padding: "10px",
                    marginBottom: "5px",
                    backgroundColor: "#f4f4f4",
                    border: `1px solid ${
                      isPositionSelected ? "#87CEEB" : "#ddd"
                    }`,
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  {`Position ${index + 1}: X = ${x}, Y = ${y}, Rotation = ${
                    rotation == 0 ? "Vertical" : "Horizontal"
                  }, Table = ${tableId}, Size = ${height}x${width}`}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableViewer;
