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
import { flushSync } from "react-dom";
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
import { Button, Modal } from "react-bootstrap";
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
  const [dividerPosition, setDividerPosition] = useState(70);
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
    console.log(
      "allObjects: ",
      allObjects.filter((o) => o.work?.workId === +workId)
    );
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

  const filteredTables =
    selectedColorId !== null
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
          overflow: "hidden",
          height: "100%"
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
              readOnly={isOrdered ? isOrdered : false}
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
              objects={objects}
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
  const [showExportModal, setShowExportModal] = useState(false);
  const bgImageBase64 = dispatch(
    getColorById(table?.color?.colorId)
  )?.imageData;
  const [tableInstances, setTableInstances] = useState([]);
  const { workIdParam } = useParams();
  const filteredTables = selectedColorId
    ? createdTables.filter((t) => t.color?.colorId === selectedColorId)
    : createdTables;
  const [tableRotation, setTableRotation] = useState(0);
  const showNav = filteredTables.length > 1;
  const allWorks = dispatch(getAllWorks());
  const selectedWork = allWorks.find((w) => w.workId == workId);
  const isOrdered = selectedWork?.isOrdered;

  const [showBackground, setShowBackground] = useState(true);

  const toggleBackground = () => setShowBackground((b) => !b);

  const allColors = useSelector((state) =>
    Array.isArray(state.colors) ? state.colors : Object.values(state.colors)
  );
  const currentUser = useSelector((state) => state.auth.user);
  // a komponens elején, az effectek fölött
  const tablePalette = useMemo(() => {
    const map = new Map();
    createdTables.forEach((t) => {
      const cid = t.color?.colorId;
      if (cid != null) {
        // megkeressük a store‑ból a teljes color objektumot
        const fullColor = allColors.find((c) => c.colorId === cid);
        if (fullColor) map.set(cid, fullColor);
      }
    });
    return Array.from(map.values());
  }, [createdTables, allColors]);
  console.log("tablePalette: ", tablePalette);

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

  // 1) GENERATE PDF
  async function generatePdfFor(tables, fileName, user, workId) {
    const pdf = new jsPDF({ orientation: "landscape", unit: "px" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const leftColW = pageW * 0.2;
    const centerColW = pageW * 0.6;
    const rightColW = pageW * 0.2;
    const margin = 10;
    let first = true;

    for (const tbl of tables) {
      // Find the global index of the table in filteredTables
      const globalIndex = filteredTables.findIndex((t) => t.id === tbl.id);
      if (globalIndex === -1) continue; // Skip if table not found

      // Set the current table index to ensure the correct table is rendered
      setCurrentTableIndex(globalIndex);

      // Wait for the DOM to update (React may need a tick to re-render)
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify that the drawingRef corresponds to the correct table
      if (!drawingRef.current) {
        console.error(`Drawing ref not found for table ${tbl.id}`);
        continue;
      }

      if (!first) pdf.addPage();
      first = false;
      let [tblH, tblW /*, tblThick */] = JSON.parse(tbl.size || "[0,0,0]");
      if (tableRotation === 90) {
        [tblH, tblW] = [tblW, tblH];
      }
      // — Left column: Header fields —
      const headerFields = [
        `Felhasználó: ${user}`,
        `Munka: ${workId}`,
        `Szín: ${tbl.colorName}`,
        `Tábla ID: ${tbl.id}`,
        `tblH: ${tblH}`,
        `tblW: ${tblW}`
      ];
      let headerY = 20;
      pdf.setFontSize(14);
      headerFields.forEach((field) => {
        const lines = pdf.splitTextToSize(field, leftColW - 2 * margin);
        pdf.text(lines, margin, headerY, { align: "left", baseline: "top" });
        headerY += lines.length * 16;
      });

      // — Right column: Group by kant code —
      const itemsOnTable = processedItems.filter((it) =>
        it.processedPositions.some((p) => p.tableId === tbl.id)
      );
      const byKant = itemsOnTable.reduce((acc, it) => {
        const rawKant = it.kant != null ? it.kant : "[-,0,0]";
        const parts = Array.isArray(rawKant)
          ? rawKant
          : rawKant.replace(/^\[|\]$/g, "").split(",");
        const [code = "-", lenCnt = "0", widCnt = "0"] = parts.map((v) =>
          v.trim()
        );
        if (!acc[code]) acc[code] = [];
        acc[code].push({
          item: it,
          lenCnt: Number(lenCnt),
          widCnt: Number(widCnt)
        });
        return acc;
      }, {});

      pdf.setFontSize(12);
      let y = 20;
      const rightX = pageW - rightColW + margin;

      for (const [code, group] of Object.entries(byKant)) {
        const title = code === "-" ? "Nincs kant" : `Kant: ${code}`;
        const titleLines = pdf.splitTextToSize(title, rightColW - 2 * margin);
        pdf.text(titleLines, rightX, y, { align: "left", baseline: "top" });
        y += titleLines.length * 14;

        for (const { item, lenCnt, widCnt } of group) {
          const [h, w] = JSON.parse(item.size);
          const qty = item.qty;
          const line = `${h} * ${w} = ${qty} || ${item.itemId}`;
          const wrapped = pdf.splitTextToSize(line, rightColW - 2 * margin);
          pdf.text(wrapped, rightX, y, { align: "left", baseline: "top" });
          y += wrapped.length * 14;

          const symY = y;
          const lenX = rightX;
          const widX = rightX + pdf.getTextWidth(`${h} * `);
          const symLen = lenCnt > 0 ? "=" : lenCnt < 0 ? "-" : "";
          const symWid = widCnt > 0 ? "=" : widCnt < 0 ? "-" : "";
          if (symLen)
            pdf.text(symLen, lenX, symY, { align: "left", baseline: "top" });
          if (symWid)
            pdf.text(symWid, widX, symY, { align: "left", baseline: "top" });

          y += 14;
          pdf.setDrawColor(0);
          pdf.setLineWidth(0.5);
          pdf.line(rightX, y, rightX + (rightColW - 2 * margin), y);
          y += 4;
        }
        y += 10; // Space between groups
      }

      // — Center: Canvas —
      flushSync(() => setCurrentTableIndex(globalIndex));

      // 2) canvas felbontás növelése scale:2-vel, CORS-szel, logolás kikapcs
      const origBg = drawingRef.current.style.backgroundImage;
      drawingRef.current.style.backgroundImage = "none";
      const canvas = await html2canvas(drawingRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false
      });
      drawingRef.current.style.backgroundImage = origBg;

      // 3) JPEG-be konvertáljuk, 0.8 quality-val – gyorsabb és kicsi
      const imgData = canvas.toDataURL("image/jpeg", 0.8);

      const baseRatio = Math.min(
        centerColW / canvas.width,
        (pageH - 2 * margin) / canvas.height,
        1
      );
      const shrinkFactor = 0.85;
      const ratio = baseRatio * shrinkFactor;
      const imgW = canvas.width * ratio;
      const imgH = canvas.height * ratio;
      const imgX = leftColW + (centerColW - imgW) / 2;
      const imgY = (pageH - imgH) / 2 + 20;
      pdf.addImage(imgData, "JPEG", imgX, imgY, imgW, imgH);

      pdf.setFontSize(12);
      pdf.setTextColor(0);

      const widthText = String(tblW);
      const widthX = imgX + imgW / 2;
      const widthY = imgY - 8;
      pdf.text(widthText, widthX, widthY, { align: "center" });

      const heightText = String(tblH);
      const heightX = imgX + imgW + 8 + 10;
      const heightY = imgY + imgH / 2;
      pdf.text(heightText, heightX, heightY, {
        align: "center",
        baseline: "middle",
        angle: 0
      });
    }

    pdf.save(fileName);
  }

  // 2) EXPORT HANDLER
  const handleExportPdf = async (separate) => {
    setIsExporting(true);
    try {
      const work = dispatch(getWorkById(workId));
      const user = (work?.user?.name || "Unknown_User").replace(/\s+/g, "_");

      const byColor = createdTables.reduce((acc, tbl) => {
        const cid = tbl.color?.colorId ?? "__NO_COLOR__";
        if (!acc[cid]) acc[cid] = [];
        acc[cid].push(tbl);
        return acc;
      }, {});

      // Ha van selectedColorId, csak arra hívjuk, külön vagy egyben is?
      if (selectedColorId != null) {
        const tbls = byColor[selectedColorId] || [];
        const colorName =
          allColors
            .find((c) => c.colorId === selectedColorId)
            ?.name.replace(/\s+/g, "_") || "no_color";

        // Ha külön akarod, lehetne: tbls.forEach, de mivel csak egy szín, elég egyszer
        await generatePdfFor(
          tbls,
          `${user}_${colorName}_${workId}.pdf`,
          user,
          workId
        );
      } else {
        // nincs filter: lehet külön színenként, vagy mind egyben
        const keys = Object.keys(byColor);
        if (separate) {
          for (const cid of keys) {
            const tbls = byColor[cid] || [];
            const colorName =
              allColors
                .find((c) => c.colorId === Number(cid))
                ?.name.replace(/\s+/g, "_") || "no_color";

            await generatePdfFor(
              tbls,
              `${user}_${colorName}_${workId}.pdf`,
              user,
              workId
            );
          }
        } else {
          // mind egy fájlba
          await generatePdfFor(
            [].concat(...Object.values(byColor)),
            `${user}_${workId}_all.pdf`,
            user,
            workId
          );
        }
      }
    } catch (e) {
      console.error(e);
      alert("Hiba az exportálás során");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleTableRotation = () => {
    setTableRotation((prev) => (prev === 0 ? 90 : 0));
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
        <p>Még nincs tábla, generálj először</p>
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
    const [origW1, origH1] = JSON.parse(item.size || "[0,0]");
    const newRot = rotation === 0 ? 1 : 0;
    const w = newRot ? origH1 : origW1;
    const h = newRot ? origW1 : origH1;

    let [origH, origW] = JSON.parse(table.size || "[0,0]");
    const tableW = origW;
    const tableH = origH;
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

    let [origH, origW] = JSON.parse(table.size || "[0,0]");
    // ha el van forgatva 90°-kal, cseréljük a dimenziókat
    //    const tableH = tableRotation === 90 ? origW : origH;
    //  const tableW = tableRotation === 90 ? origH : origW;

    const [tableH, tableW] = JSON.parse(table.size || "[0,0]");

    const onMouseMove = (me) => {
      const deltaX = me.clientX - e.clientX;
      const deltaY = me.clientY - e.clientY;
      let dx, dy;
      if (tableRotation === 90) {
        // 90°-os elforgatásnál felcseréljük és invertáljuk az axeseket
        dx = deltaY / scaleFactor;
        dy = -deltaX / scaleFactor;
      } else {
        // alapértelmezett (0°)
        dx = deltaX / scaleFactor;
        dy = deltaY / scaleFactor;
      }
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
    const pos = selectedItem.processedPositions.find(
      (p) => p.instanceId === instanceId
    );
    if (!pos) return;
    const { rotation } = pos;
    const [origW, origH] = JSON.parse(selectedItem.size || "[0,0]");
    const itemWidth = rotation === 1 ? origH : origW;
    const itemHeight = rotation === 1 ? origW : origH;

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

  const controlButton = {
    width: "140px", // itt állítod be az egységes szélességet
    padding: "8px 16px",
    fontSize: "14px",
    cursor: "pointer",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "12px",
    textAlign: "center"
  };

  return (
    <div
      style={{
        padding: "20px",
        position: "relative",
        textAlign: "center",
        height: "100%"
      }}
    >
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Exportálás PDF</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedColorId == null
            ? "Hogyan szeretnéd exportálni a táblákat?"
            : `Biztosan exportálod a 
         ${
           allColors.find((c) => c.colorId === selectedColorId)?.name ||
           "kiválasztott"
         } színt?`}
        </Modal.Body>

        <Modal.Footer>
          {selectedColorId == null ? (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  handleExportPdf(false); // egy fájlban
                  setShowExportModal(false);
                }}
              >
                Egyben
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  handleExportPdf(true); // színenként külön
                  setShowExportModal(false);
                }}
              >
                Színenként külön
              </Button>
              <Button
                variant="outline-dark"
                onClick={() => setShowExportModal(false)}
              >
                Mégsem
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline-dark"
                onClick={() => {
                  handleExportPdf(false); // csak a kiszűrt szín
                  setShowExportModal(false);
                }}
              >
                Biztos
              </Button>
              <Button
                variant="outline-dark"
                onClick={() => setShowExportModal(false)}
              >
                Mégsem
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

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
          <option value="">Összes szín</option>
          {tablePalette.map((c) => (
            <option key={c.colorId} value={c.colorId}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "8px"
        }}
      >
        {!cannotEdit ? (
          <button onClick={onGenerate} style={controlButton}>
            Generálás
          </button>
        ) : (
          <></>
        )}
        {!isEditing && (
          <>
            <button
              onClick={() => setShowExportModal(true)}
              style={controlButton}
            >
              Exportálás PDF
            </button>

            {!cannotEdit ? (
              <button onClick={startEditing} style={controlButton}>
                Szerkesztés
              </button>
            ) : (
              <></>
            )}
          </>
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
            gap: "8px",
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
                    {editedTables
                      .filter((t) => t.color?.colorId === table.color?.colorId) // csak azonos szín
                      .map((t) => (
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
            left: "0px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            zIndex: 2001
          }}
        >
          <button
            onClick={toggleTableRotation}
            style={{
              padding: "8px 16px",
              backgroundColor: "#FF9800",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Tábla forgatása
          </button>

          <button
            onClick={toggleBackground}
            style={{
              padding: "8px 16px",
              backgroundColor: "#FF9800",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            {showBackground ? "Háttér ki" : "Háttér be"}
          </button>
        </div>

        <div
          ref={drawingRef}
          style={{
            position: "relative",
            display: "inline-block",
            marginTop: tableRotation === 90 ? "0" : "20px",
            width: `${width * scaleFactor}px`,
            height: `${height * scaleFactor}px`,
            border: `${BORDER_WIDTH}px solid ${
              isEditing ? "#4CAF50" : "black"
            }`,
            transform: `rotate(${tableRotation}deg)`,
            transformOrigin: "center center",
            boxSizing: "content-box",
            backgroundImage: showBackground ? backgroundImageStyle : "none",
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            overflow: "visible"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: `-${tableRotation === 90 ? 35 : 30}px`,
              left: "50%",
              transform: `translateX(-50%) rotate(${
                tableRotation === 90 ? -90 : 0
              }deg)`,
              transformOrigin: "center",
              fontSize: "14px",
              fontWeight: "bold",
              zIndex: 10,
              padding: "2px 4px",
              borderRadius: "4px"
            }}
          >
            {width || "Nincs méret"}
          </div>

          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `-${tableRotation === 90 ? 35 : 50}px`,
              transform: `translateY(-50%) rotate(${
                tableRotation === 90 ? -90 : 0
              }deg)`,
              transformOrigin: "center",
              fontSize: "14px",
              fontWeight: "bold",
              zIndex: 10,
              padding: "2px 4px",
              borderRadius: "4px"
            }}
          >
            {height || "Nincs méret"}
          </div>
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
                const scaledWidth = itemWidth * scaleFactor;
                const scaledHeight = itemHeight * scaleFactor;

                // 2) minimalizáljuk, hogy sose legyen 20px-nél kisebb
                const MIN_PX = 5;
                // ha ez alá esik, elrejtjük a részleteket
                const DETAIL_THRESHOLD = 30;
                const scaledW = itemWidth * scaleFactor;
                const scaledH = itemHeight * scaleFactor;
                const dispWpx = Math.max(scaledW, MIN_PX);
                const dispHpx = Math.max(scaledH, MIN_PX);
                const isTooSmall =
                  scaledW < DETAIL_THRESHOLD || scaledH < DETAIL_THRESHOLD;
                const fontSizePx = Math.max(
                  6,
                  Math.min(12, Math.min(dispWpx, dispHpx) / 5)
                );
                const paddingPx = fontSizePx / 4;

                const positionKey = `${item.itemId}-${index}`;
                const isSelected =
                  selectedItemPosition?.itemId === item.itemId &&
                  selectedItemPosition?.instanceId === pos.instanceId;

                const dispWidth = rotation == 1 ? itemHeight : itemWidth;
                const dispHeight = rotation == 1 ? itemWidth : itemHeight;
                const isRotated = rotation == 1;
                const scaledX = x * scaleFactor;
                const scaledY = y * scaleFactor;

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
                      width: `${rotation == 1 ? dispHpx : dispWpx}px`,
                      height: `${rotation == 1 ? dispWpx : dispHpx}px`,
                      backgroundColor: "transparent",
                      border: `1px solid ${isSelected ? "#87CEEB" : "black"}`,
                      boxSizing: "border-box",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 2,
                      cursor: isEditing ? "move" : "pointer",
                      transform:
                        rotation == 1
                          ? `rotate(${tableRotation == 90 ? -90 : 90}deg)`
                          : "rotate(0deg)",
                      transformOrigin: "center"
                    }}
                  >
                    {!isTooSmall && (
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          textAlign: "center",
                          transform: `rotate(${
                            (isRotated
                              ? tableRotation === 90
                                ? 90
                                : -90
                              : 0) - tableRotation
                          }deg)`,
                          color: "#333"
                        }}
                      >
                        <span
                          style={{
                            border: isTooSmall ? "none" : "0.5px solid black",
                            borderRadius: "2px",
                            fontSize: `${fontSizePx}px`,
                            padding: `${paddingPx}px`,
                            color: "#333",
                            marginBottom: "2px"
                          }}
                        >
                          {item.itemId}
                        </span>
                        <br />
                        {item.details}
                      </div>
                    )}

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
                          (isRotated ? (tableRotation == 90 ? 90 : -90) : 0) -
                          tableRotation
                        }deg)`,
                        fontSize: isTooSmall ? "8px" : "10px",
                        lineHeight: isTooSmall ? "1" : "normal",
                        textAlign: "center",
                        fontWeight: "normal",
                        marginTop: isTooSmall ? "5px" : "2px",
                        marginTop:
                          tableRotation === 90
                            ? "0" // ha vízszintesen forgatott a tábla, nagyobb lentréptetés
                            : isTooSmall
                            ? "3px" // ha túl kicsi, nullával
                            : "2px",
                        cursor: "pointer",
                        padding: isTooSmall ? "0px" : "2px",
                        fontWeight: "bold",
                        border: `1px solid ${
                          isSelected && selectedDimension == "width"
                            ? "#87CEEB"
                            : "transparent"
                        }`
                      }}
                    >
                      {dispWidth}
                      {!isTooSmall && (
                        <>
                          <br />
                          {widthSuffix}
                        </>
                      )}
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
                          (isRotated ? (tableRotation == 90 ? 90 : -90) : 0) -
                          tableRotation
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
                        }`,
                        fontSize: isTooSmall ? "8px" : "10px",
                        lineHeight: isTooSmall ? "1" : "normal"
                      }}
                    >
                      {dispHeight}
                      {!isTooSmall && (
                        <>
                          <br />
                          {heightSuffix}
                        </>
                      )}
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
