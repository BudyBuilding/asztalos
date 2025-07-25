import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Form,
  Row,
  Col,
  Modal,
  Dropdown,
  InputGroup,
  Image as RBImage, // Added for image display
  Accordion
} from "react-bootstrap";
import { IonIcon } from "@ionic/react";
import { pencil, trash, add, copyOutline } from "ionicons/icons";
import {
  getAllScripts,
  getScriptById,
  getAllSettings,
  getScriptItemsByScript
} from "../../data/getters";
import scriptApi from "../../data/api/scriptApi";
import { AxesViewer } from "@babylonjs/core/Debug/axesViewer";
import scriptItemApi from "../../data/api/scriptItemApi";
import {
  deleteScriptItem,
  addScriptItem
} from "../../data/store/actions/scriptStoreFunctions";
import Loading from "../helpers/Loading";
import {
  Engine,
  Scene,
  Vector3,
  MeshBuilder,
  ArcRotateCamera,
  HemisphericLight,
  StandardMaterial,
  Color3,
  Color4,
  Quaternion,
  Matrix
} from "@babylonjs/core";

import {
  parseSettingString,
  serializeSettingArray
} from "./scriptsPageutil/serializeSettings";
import {
  evalArr,
  expandIterated,
  extractRawList,
  evaluateFormula,
  parseConditionalPosition
} from "./scriptsPageutil/evalArr";

// Custom backdrop CSS
const style = `
  .custom-backdrop {
    background-color: rgba(0, 0, 0, 0.2);
  }
`;
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = style;
document.head.appendChild(styleSheet);

export default function ScriptsPage() {
  const { scriptId } = useParams();
  const isEditing = !!scriptId;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    setShowEditor(isEditing);
  }, [isEditing]);
  const scripts = useSelector((state) => state.scripts || []);
  const settingsList = useSelector((state) => state.settings || []);
  const scriptItems = useSelector((state) => {
    const all = state.scriptItems || [];
    return scriptId
      ? all
          .filter((it) => String(it.scriptId) == String(scriptId))
          .filter((it) => it.itemId !== -1)
      : [];
  });
  console.log("----------------------------------------------");
  console.log(evalArr("[18,0,i(18, height - 36, c)]", [], [1000, 1000, 1000]));
  const [positionDSL, setPositionDSL] = useState("");
  const [rotationDSL, setRotationDSL] = useState("");
  const [editingSettingId, setEditingSettingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditor, setShowEditor] = useState(isEditing);
  const [scriptList, setScriptList] = useState([]);
  const [script, setScript] = useState({
    name: "",
    room: "",
    setting: "",
    imageData: null,
    imageContentType: null
  });
  const [scriptImageFile, setScriptImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const scriptFileInputRef = useRef();
  const [autoIterate, setAutoIterate] = useState(false);
  const [parsedSettings, setParsedSettings] = useState([]);
  const [newItem, setNewItem] = useState({
    qty: 1,
    size: "",
    position: [""],
    rotation: ["0,0,0"],
    refScript: "",
    refSettings: [],
    rotable: false,
    kant: "[-,0,0]",
    file: null,
    material: ""
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [userDimensions, setUserDimensions] = useState({
    width: 1000,
    height: 1000,
    depth: 1000
  });
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [newSettingPair, setNewSettingPair] = useState({ id: "", value: "" });
  const [activeImageKey, setActiveImageKey] = useState(null);

  const [hiddenItems, setHiddenItems] = useState(new Set());

  const toggleVisibility = (item) => {
    setHiddenItems((prev) => {
      const next = new Set(prev);
      const key = item.itemId > 0 ? item.itemId : item.tempId;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  useEffect(() => {
    if (script.imageData && script.imageContentType) {
      setPreviewImage(
        `data:${script.imageContentType};base64,${script.imageData}`
      );
    } else {
      setPreviewImage(null);
    }
  }, [script.imageData, script.imageContentType]);

  const onScriptFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        // teljes kép beleszűkítése 128×128‑as raszterre
        ctx.drawImage(img, 0, 0, 128, 128);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        // base64 adat kinyerése
        const base64 = dataUrl.split(",")[1];
        setPreviewImage(dataUrl);
        setScript((prev) => ({
          ...prev,
          imageData: base64,
          imageContentType: "image/jpeg"
        }));
        setScriptImageFile(file);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDuplicate = async (orig) => {
    try {
      // 1) új script létrehozása
      const cloned = await dispatch(
        scriptApi.createScriptApi({
          name: `${orig.name} (Másolat)`,
          room: orig.room,
          setting: orig.setting
        })
      );
      // 2) eredeti elemek lekérése
      const items = await dispatch(getScriptItemsByScript(orig.scriptId));
      // 3) elemek klónozása az új scripthez
      for (const it of items) {
        const created = await dispatch(
          scriptItemApi.createScriptItemApi({
            script_id: cloned.scriptId,
            qty: it.qty,
            size: it.size,
            position: it.position,
            rotation: it.rotation,
            refScriptId: it.refScript,
            refSettings: it.refSettings,
            name: it.name,
            kant: it.kant,
            rotable: it.rotable,
            material: newItem.material || ""
          })
        );
        const normalized = {
          itemId: created.itemId,
          scriptId: created.scriptId,
          // plusz minden egyéb mező, ami kell a renderhez:
          qty: created.qty,
          size: created.size,
          position: created.position,
          rotation: created.rotation,
          refScript: created.refScriptId,
          refSettings: created.refSettings,
          name: created.name,
          kant: created.kant,
          rotable: created.rotable
        };

        dispatch(addScriptItem(normalized));
      }
      dispatch(getScriptItemsByScript(cloned.scriptId));

      await dispatch(getAllScripts());
    } catch (err) {
      alert("Hiba a duplikálás során");
    }
  };

  const handleNameChange = (item, newName) => {
    setPendingItems((prev) => {
      const key = item.itemId > 0 ? item.itemId : item.tempId;
      const idx = prev.findIndex(
        (p) => (p.itemId > 0 ? p.itemId : p.tempId) === key
      );
      if (idx > -1) {
        // már van pending módosítás erre az itemre → frissítjük
        const copy = [...prev];
        copy[idx] = { ...copy[idx], name: newName };
        return copy;
      } else {
        // új pending módosítás
        return [...prev, { ...item, name: newName }];
      }
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        await dispatch(getAllScripts());

        await dispatch(getAllSettings());

        if (isEditing) {
          const s = await dispatch(getScriptById(scriptId));

          setScript({
            name: s.name || "",
            room: s.room || "",
            setting: s.setting || "",
            imageData: s.imageData || null,
            imageContentType: s.imageContentType || null
          });

          setParsedSettings(
            s.setting ? s.setting.split(",").map((p) => p) : []
          );
          if (s.setting) {
            setParsedSettings(parseSettingString(s.setting));
          }
          await scriptItemApi.getAllScriptItemsForScriptApi(scriptId);
          await dispatch(getScriptItemsByScript(scriptId));
        }
      } catch (err) {
        setError("Hiba az adatok betöltésekor");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, scriptId, isEditing]);

  useEffect(() => setScriptList(scripts), [scripts]);

  // after you’ve loaded scriptItems and scripts into state
  useEffect(() => {
    if (!scriptItems.length || !scripts.length) return;

    // start from whatever settings you already have
    let merged = [...parsedSettings];

    scriptItems.forEach((item) => {
      if (!item.refScript) return;
      // find that referenced script
      const parent = scripts.find(
        (s) => String(s.scriptId) === String(item.refScript)
      );
      if (!parent?.setting) return;

      // parse its defaults
      const defaults = parseSettingString(parent.setting);
      defaults.forEach((def) => {
        if (!merged.some((s) => s.settingId === def.settingId)) {
          merged.push(def);
        }
      });
    });

    // only update if we actually added something
    if (merged.length !== parsedSettings.length) {
      setParsedSettings(merged);
      // also keep your serialized `script.setting` in sync
      setScript((prev) => ({
        ...prev,
        setting: serializeSettingArray(merged)
      }));
    }
  }, [scriptItems, scripts]);

  const refParsedSettings = useMemo(() => {
    if (!newItem.refScript) return [];
    const parent = scripts.find(
      (s) => String(s.scriptId) === String(newItem.refScript)
    );
    return parent ? parseSettingString(parent.setting || "") : [];
  }, [newItem.refScript, scripts]);

  const rawItems = useMemo(() => {
    const deleted = pendingItems
      .filter((it) => it.itemId === -1)
      .map((it) => it.originalItemId)
      .filter(Boolean);

    const pendingIds = pendingItems
      .filter((it) => it.itemId !== -1)
      .map((it) => it.itemId)
      .filter((id) => id !== -1);

    const kept = scriptItems.filter(
      (it) => !deleted.includes(it.itemId) && !pendingIds.includes(it.itemId)
    );

    // Csak az újak (tempId) és a létezők frissítései (itemId > 0)
    const additions = pendingItems.filter(
      (it) => it.tempId !== undefined || it.itemId !== -1
    );

    return [...kept, ...additions].map((it) => ({
      ...it,
      isPending: it.tempId != null,
      rawSize: it.size,
      name: it.name,
      rawPosition: it.position.includes("?")
        ? [it.position]
        : extractRawList(it.position),
      rawRotation: extractRawList(it.rotation)
    }));
  }, [scriptItems, pendingItems]);

  const allScriptItems = useSelector((state) => state.scriptItems || []);

  useEffect(() => {
    const refs = Array.from(
      new Set(
        rawItems
          .map((it) => it.refScript)
          .filter((id) => id !== undefined && id !== null && id !== "")
      )
    );
    if (refs.length === 0) return;
    refs.forEach((refId) => {
      dispatch(getScriptItemsByScript(refId));
    });
  }, [dispatch, rawItems]);

  const settingsObj = useMemo(
    () => Object.fromEntries(parsedSettings.map((s) => [s.settingId, s.value])),
    [parsedSettings]
  );

  const processedItems = useMemo(() => {
    const byScript = allScriptItems.reduce((acc, it) => {
      acc[it.scriptId] = acc[it.scriptId] || [];
      acc[it.scriptId].push(it);
      return acc;
    }, {});

    function expandItem(item, parentSettings, parentSize) {
      // Normalize settings array
      const settingsArr = Array.isArray(parentSettings)
        ? parentSettings
        : Object.entries(parentSettings).map(([settingId, value]) => ({
            settingId,
            value: String(value)
          }));

      // 1) SIZE: handle ternary and macros in one go
      const size = parseConditionalPosition(
        item.size,
        settingsArr,
        parentSize,
        1
      )[0];

      // 2) QTY
      const qtyExpr = evaluateFormula(
        item.qty,
        Object.fromEntries(settingsArr.map((s) => [s.settingId, s.value]))
      );
      const n = Math.max(1, Math.round(new Function(`return (${qtyExpr})`)()));

      // 3) POSITION: ternary + i(...) expansion
      const relPositions = parseConditionalPosition(
        item.position,
        settingsArr,
        parentSize,
        n
      );

      // 4) ROTATION
      const relRotations = parseConditionalPosition(
        item.rotation,
        settingsArr,
        parentSize,
        n
      );

      // 5) Pivot for nested transforms
      const pivot = new Vector3(size[0] / 2, size[1] / 2, size[2] / 2);

      // 6) No refScript: return direct instances
      if (!item.refScript) {
        return relPositions.map((pos, idx) => ({
          ...item,
          qty: 1,
          evaluatedSize: size,
          evaluatedPosition: [pos],
          evaluatedRotation: [relRotations[idx]]
        }));
      }

      // 7) Handle nested refScripts (rest of logic unchanged)
      const children = byScript[item.refScript] || [];
      const defaultSettings = parseSettingString(item.refSettings);
      const instances = [];

      relPositions.forEach((pPos, idx) => {
        const pRot = relRotations[idx] || [0, 0, 0];
        const pQuat = Quaternion.RotationYawPitchRoll(
          (pRot[1] * Math.PI) / 2,
          (pRot[0] * Math.PI) / 2,
          (pRot[2] * Math.PI) / 2
        );
        const pMat = Matrix.Identity();
        pQuat.toRotationMatrix(pMat);

        children.forEach((child) => {
          //   const adds = expandItem(child, defaultSettings, size);
          const mergedSettings = [...settingsArr, ...defaultSettings].filter(
            // dedupe same settingId, keep the refScript’s override last
            (v, i, self) =>
              self.findIndex((x) => x.settingId === v.settingId) === i
          );
          const adds = expandItem(child, mergedSettings, size);
          adds.forEach((inst) => {
            inst.evaluatedPosition = inst.evaluatedPosition.map(([x, y, z]) => {
              const v0 = new Vector3(x, y, z).subtract(pivot);
              const v1 = Vector3.TransformCoordinates(v0, pMat);
              const v2 = v1.add(pivot).add(new Vector3(...pPos));
              return [v2.x, v2.y, v2.z];
            });
            inst.evaluatedRotation = inst.evaluatedRotation.map(
              ([cx, cy, cz]) => {
                const cQuat = Quaternion.RotationYawPitchRoll(
                  (cy * Math.PI) / 2,
                  (cx * Math.PI) / 2,
                  (cz * Math.PI) / 2
                );
                const combo = pQuat.multiply(cQuat).toEulerAngles();
                return [
                  Math.round(combo.x / (Math.PI / 2)) % 4,
                  Math.round(combo.y / (Math.PI / 2)) % 4,
                  Math.round(combo.z / (Math.PI / 2)) % 4
                ];
              }
            );
            instances.push(inst);
          });
        });
      });

      return instances;
    }
    let all = [];

    rawItems.forEach((raw) => {
      all.push(
        ...expandItem(
          raw, // <-- no autoIterate override here
          parsedSettings,
          [userDimensions.width, userDimensions.height, userDimensions.depth],
          raw.qty // <-- always the raw qty
        )
      );
    });

    console.log("all: ", all);
    console.log("------------------------------------------");

    const seen = new Set();
    return all.filter((inst) => {
      const uniqueId = inst.itemId !== -1 ? inst.itemId : inst.tempId;
      const key = uniqueId + "|" + JSON.stringify(inst.evaluatedPosition);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [rawItems, allScriptItems, parsedSettings, userDimensions]);

  useEffect(() => {}, [processedItems]);

  const handleScriptChange = (e) =>
    setScript((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleDimensionChange = (e) =>
    setUserDimensions((prev) => ({
      ...prev,
      [e.target.name]: Number(e.target.value)
    }));
  const handleItemChange = (e) =>
    setNewItem((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const addItem = () => {
    // Beállítjuk a settings objektumot
    const settingsObj = Object.fromEntries(
      parsedSettings.map((s) => [s.settingId, s.value])
    );

    // Kiértékeljük a qty kifejezést
    const qtyExpr = evaluateFormula(newItem.qty, settingsObj);
    const q = Number(new Function(`return (${qtyExpr})`)());
    /*    if (isNaN(q) || q < 1) {
      return alert("A mennyiség minimum 1 kell legyen.");
    }*/

    // Kant előkészítése
    let [kantType, hkant, skant] = (newItem.kant || "[-,0,0]")
      .slice(1, -1)
      .split(",");
    if (kantType === "-") {
      hkant = "0";
      skant = "0";
    }
    const kantString = `[${kantType},${hkant},${skant}]`;

    /***************************** */
    const posField = autoIterate
      ? positionDSL
      : newItem.position
          .map((p) => (p.trim() ? `[${p}]` : "[0,0,0]"))
          .join(",");

    const rotField = autoIterate
      ? rotationDSL
      : newItem.rotation
          .map((r) => (r.trim() ? `[${r}]` : "[0,0,0]"))
          .join(",");
    /***************************** */
    const item = {
      qty: q,
      size: newItem.size ? `[${newItem.size}]` : "[100,100,100]",
      position: posField,
      rotation: rotField,
      refScript: newItem.refScript || null,
      refSettings: serializeSettingArray(newItem.refSettings),
      rotable: newItem.rotable,
      kant: kantString,
      name: "",
      tempId: newItem.tempId || Date.now(),
      itemId: newItem.itemId || -1
    };

    // Betesszük a pendingItems-be (szerkesztés vagy újdonság kezelése)
    /*   setPendingItems((prev) => {
      if (editingIndex !== null && rawItems[editingIndex]) {
        const original = rawItems[editingIndex];
        const idx = prev.findIndex(
          (p) => p.itemId === original.itemId || p.tempId === original.tempId
        );
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = item;
          return copy;
        }
      }
      return [...prev, item];
    });*/

    setPendingItems((prev) => {
      if (editingItemId !== null) {
        const idx = prev.findIndex(
          (p) =>
            p.itemId === editingItemId ||
            (p.tempId !== undefined && p.tempId === editingItemId)
        );
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = item;
          return copy;
        }
      }
      return [...prev, item];
    });

    // Visszaállítjuk az új elem űrlapot
    setNewItem((prev) => ({
      qty: 1,
      size: "",
      position: [""],
      rotation: ["0,0,0"],
      rotable: false,
      kant: "[-,0,0]",
      file: null,
      refScript: prev.refScript,
      refSettings: prev.refSettings
    }));

    setEditingIndex(null);
  };

  useEffect(() => {
    if (editingIndex !== null && !rawItems[editingIndex]) {
      setEditingIndex(null);
    }
  }, [rawItems, editingIndex]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!script.name.trim() || !script.room.trim()) {
      return setError("Kérlek, töltsd ki a Name és a Room mezőket is!");
    }

    const scriptData = {
      name: script.name,
      room: script.room,
      setting: script.setting
    };

    try {
      let usedScriptId = scriptId;

      if (isEditing) {
        try {
          await dispatch(
            scriptApi.updateScriptApi(
              { script_id: scriptId, ...scriptData },
              scriptImageFile
            )
          );
        } catch (err) {
          if (
            !(err.status === 400 && err.data?.message.includes("no changes"))
          ) {
            throw err;
          }
        }
      } else {
        const newS = await dispatch(
          scriptApi.createScriptApi(scriptData, scriptImageFile)
        );
        usedScriptId = newS.scriptId;
      }

      for (const it of pendingItems) {
        const posStr = Array.isArray(it.position)
          ? it.position.join(",")
          : it.position;
        const rotStr = Array.isArray(it.rotation)
          ? it.rotation.join(",")
          : it.rotation;

        if (it.itemId === -1 && it.originalItemId) {
          await dispatch(scriptItemApi.deleteScriptItemApi(it.originalItemId));
          dispatch(deleteScriptItem(it.originalItemId));
          dispatch(getScriptItemsByScript(usedScriptId));
        } else if (it.itemId > 0) {
          await dispatch(
            scriptItemApi.updateScriptItemApi({
              itemId: it.itemId,
              script_id: usedScriptId,
              qty: it.qty,
              size: it.size,
              position: posStr,
              rotation: rotStr,
              refScript: it.refScript,
              refSettings: it.refSettings,
              name: it.name,
              kant: it.kant,
              rotable: it.rotable
            })
          );
        } else {
          console.log("New item data:", {
            script_id: usedScriptId,
            qty: it.qty,
            size: it.size,
            position: posStr,
            rotation: rotStr,
            refScript: it.refScript,
            refSettings: it.refSettings,
            name: it.name,
            kant: it.kant,
            rotable: it.rotable
          });

          const created = await dispatch(
            scriptItemApi.createScriptItemApi(
              {
                script_id: usedScriptId,
                qty: it.qty,
                size: it.size,
                position: posStr,
                rotation: rotStr,
                refScriptId: it.refScript,
                refSettings: it.refSettings,
                name: it.name,
                kant: it.kant,
                rotable: it.rotable
              },
              newItem.file
            )
          );

          setPendingItems((prev) =>
            prev.map((p) =>
              p.tempId === it.tempId ? { ...p, itemId: created.itemId } : p
            )
          );

          dispatch(addScriptItem(created));
          dispatch(getScriptItemsByScript(usedScriptId));
        }
      }

      setPendingItems([]);
      setShowEditor(false);
      await dispatch(getAllScripts());
      await dispatch(getScriptItemsByScript(usedScriptId));
      navigate("/scripts");
    } catch (err) {
      setError("Hiba a script mentésekor");
    }
  };

  const addSettingPair = () => {
    const { id, value } = newSettingPair;
    if (!id || !value) return alert("Adj meg érvényes ID-t és értéket!");
    if (parsedSettings.some((s) => String(s.settingId) === String(id)))
      return alert("Ez a setting ID már létezik.");
    const newEntry = {
      settingId: String(id),
      value: String(value)
    };
    const updated = [...parsedSettings, newEntry];
    setParsedSettings(updated);
    setScript((prev) => ({
      ...prev,
      setting: serializeSettingArray(updated)
    }));
    setShowSettingModal(false);
    setNewSettingPair({ id: "", value: "" });
  };

  useEffect(() => {
    if (!showEditor || loading || !canvasRef.current) return;

    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    scene.clearColor = new Color4(1, 1, 1, 1);
    sceneRef.current = scene;

    const camera = new ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 4,
      2,
      Vector3.Zero(),
      scene
    );
    camera.minZ = 0.1;
    camera.maxZ = 10000;
    camera.attachControl(canvasRef.current, false);
    camera.wheelPrecision = 50;

    new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const originSphere = MeshBuilder.CreateSphere(
      "originSphere",
      { diameter: 500 },
      scene
    );
    originSphere.position = Vector3.Zero();
    const originMat = new StandardMaterial("originMat", scene);
    originMat.diffuseColor = new Color3(1, 0, 0);
    originSphere.material = originMat;

    // 2) vagy ha inkább tengelyeket is szeretnél látni:
    new AxesViewer(scene, 250);

    engine.runRenderLoop(() => scene.render());
    return () => engine.dispose();
  }, [showEditor, loading]);
  /********************************************* */
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // régi meshek törlése (kivéve a floor-t)
    scene.meshes.filter((m) => m.name !== "floor").forEach((m) => m.dispose());

    const { width, height, depth } = userDimensions;
    const maxDim = Math.max(width, height, depth) || 1;
    const globalScale = 1 / maxDim;

    //    processedItems.forEach((it, idx) => {
    processedItems
      .filter((it) => !hiddenItems.has(it.itemId > 0 ? it.itemId : it.tempId))
      .forEach((it, idx) => {
        const [w, h, d] = it.evaluatedSize;
        const positions = it.evaluatedPosition;
        const rotations = it.evaluatedRotation;

        for (let j = 0; j < it.qty; j++) {
          const rawPos = positions[j] || [0, 0, 0];
          const rawRot = rotations[j] || [0, 0, 0];

          const sw = w * globalScale;
          const sh = h * globalScale;
          const sd = d * globalScale;
          const px = rawPos[0] * globalScale;
          const py = rawPos[1] * globalScale;
          const pz = rawPos[2] * globalScale;

          const box = MeshBuilder.CreateBox(
            `box_${idx}_${j}`,
            { width: sw, height: sh, depth: sd },
            scene
          );

          box.setPivotPoint(new Vector3(-sw / 2, -sh / 2, -sd / 2));
          box.position = new Vector3(px + sw / 2, py + sh / 2, pz + sd / 2);

          // forgatás a pivot körül
          box.rotation = new Vector3(
            (rawRot[0] * Math.PI) / 2,
            (rawRot[1] * Math.PI) / 2,
            (rawRot[2] * Math.PI) / 2
          );
          const mat = new StandardMaterial(`mat_${idx}_${j}`, scene);
          const col = Color3.FromHexString(it.material || "#4c4c4c");
          mat.diffuseColor = col;
          box.material = mat;
        }
      });
  }, [processedItems, userDimensions, parsedSettings]);

  if (loading) return <Loading />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const availableSettings = settingsList.filter(
    (s) =>
      !parsedSettings.some((ps) => Number(ps.settingId) === Number(s.settingId))
  );

  const handleRemoveSetting = async (id) => {
    const updated = parsedSettings.filter(
      (s) => String(s.settingId) !== String(id)
    );
    setParsedSettings(updated);
    setScript((prev) => ({
      ...prev,
      setting: serializeSettingArray(updated)
    }));
    if (isEditing) {
      try {
        await dispatch(
          scriptApi.updateScriptApi(
            {
              script_id: scriptId,
              name: script.name,
              room: script.room,
              setting: serializeSettingArray(updated)
            },
            newItem.file
          )
        );
      } catch (err) {}
    }
  };

  const handleDeleteItem = (item) => {
    if (item.itemId > 0) {
      setPendingItems((prev) => [
        ...prev,
        { originalItemId: item.itemId, itemId: -1 }
      ]);
    } else {
      setPendingItems((prev) => prev.filter((p) => p.tempId !== item.tempId));
    }
  };

  const saveSettingPair = () => {
    const { id, value } = newSettingPair;
    if (!id) {
      alert("Adj meg érvényes ID-t!");
      return;
    }
    if (editingSettingId) {
      // Frissítés
      const updated = parsedSettings.map((s) =>
        String(s.settingId) === String(editingSettingId)
          ? { settingId: String(id), value: String(value) }
          : s
      );
      setParsedSettings(updated);
      setEditingSettingId(null);
    } else {
      // Új hozzáadása
      if (parsedSettings.some((s) => String(s.settingId) === String(id))) {
        alert("Ez a setting ID már létezik.");
        return;
      }
      setParsedSettings((prev) => [
        ...prev,
        { settingId: String(id), value: String(value) }
      ]);
    }
    // szinkronizálás a script objektummal
    setScript((prev) => ({
      ...prev,
      setting: serializeSettingArray(
        editingSettingId
          ? parsedSettings.map((s) =>
              String(s.settingId) === String(editingSettingId)
                ? { settingId: String(id), value: String(value) }
                : s
            )
          : [...parsedSettings, { settingId: String(id), value: String(value) }]
      )
    }));
    setShowSettingModal(false);
    setNewSettingPair({ id: "", value: "" });
  };

  return (
    <div className="container">
      <h1>Tervek</h1>

      {!showEditor ? (
        <>
          <Button className="mb-3" onClick={() => setShowEditor(true)}>
            Új terv Létrehozása
          </Button>
          <div
            style={{
              maxHeight: "80vh",
              overflowY: "auto",
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxSizing: "border-box"
            }}
          >
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Azonosító</th>
                  <th>Név</th>
                  <th>Szoba</th>
                  <th>Műveletek</th>
                </tr>
              </thead>
              <tbody>
                {scriptList.length === 0 ? (
                  <tr>
                    <td colSpan="4">Nincsenek tervek</td>
                  </tr>
                ) : (
                  scriptList
                    .slice()
                    .reverse()
                    .map((s) => (
                      <tr key={s.scriptId}>
                        <td>{s.scriptId}</td>
                        <td>{s.name}</td>
                        <td>{s.room}</td>
                        <td>
                          <IonIcon
                            icon={pencil}
                            style={{ cursor: "pointer", marginRight: 8 }}
                            onClick={() => {
                              navigate(`/scripts/${s.scriptId}`);
                              setShowEditor(true);
                            }}
                          />
                          <IonIcon
                            icon={copyOutline}
                            style={{ cursor: "pointer", marginRight: 8 }}
                            onClick={() => handleDuplicate(s)}
                          />
                          <IonIcon
                            icon={trash}
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              dispatch(scriptApi.deleteScriptApi(s.scriptId))
                            }
                          />
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </Table>
          </div>
        </>
      ) : (
        <>
          <Row className="align-items-center mb-3">
            <Col>
              <h2>{isEditing ? "Terv szerkesztése" : "Új terv"}</h2>
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>Név</InputGroup.Text>
                <Form.Control
                  name="name"
                  value={script.name}
                  onChange={handleScriptChange}
                  placeholder="Terv neve"
                  required
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>Szoba</InputGroup.Text>
                <Form.Control
                  name="room"
                  value={script.room}
                  onChange={handleScriptChange}
                  placeholder="Szoba"
                  required
                />
              </InputGroup>
            </Col>
            <Col md="auto">
              <Button variant="secondary" onClick={() => setShowEditor(false)}>
                Mégsem
              </Button>
            </Col>
            <Col md="auto">
              <Button variant="primary" onClick={handleSubmit}>
                Mentés
              </Button>
            </Col>
            <Col md="auto">
              <Accordion
                activeKey={activeImageKey}
                onSelect={(key) =>
                  setActiveImageKey(key === activeImageKey ? null : key)
                }
                className="mb-3"
              >
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Terv kép</Accordion.Header>
                  <Accordion.Body style={{ textAlign: "center" }}>
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Script preview"
                        style={{
                          width: 128,
                          height: 128,
                          objectFit: "cover",
                          border: "1px solid #ccc"
                        }}
                      />
                    ) : isEditing ? (
                      <RBImage
                        src={`data:${script.imageContentType};base64,${script.imageData}`}
                        alt="Script image"
                        thumbnail
                        fluid
                        style={{ maxHeight: 300 }}
                      />
                    ) : (
                      <span className="text-muted">
                        Hozzáadás után itt fog megjelenni a kép
                      </span>
                    )}
                    {isEditing && (
                      <>
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => scriptFileInputRef.current.click()}
                          >
                            Kép változtatás
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            ref={scriptFileInputRef}
                            onChange={onScriptFileChange}
                            style={{ display: "none" }}
                          />
                        </div>
                      </>
                    )}
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Col>
          </Row>

          <Row className="align-items-center mb-3">
            {["width", "height", "depth"].map((dim) => (
              <Col key={dim}>
                <InputGroup>
                  <InputGroup.Text>
                    {{
                      width: "Szélesség",
                      height: "Magasság",
                      depth: "Mélység"
                    }[dim] ?? dim.charAt(0).toUpperCase() + dim.slice(1)}
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    name={dim}
                    value={userDimensions[dim]}
                    onChange={handleDimensionChange}
                  />
                </InputGroup>
              </Col>
            ))}
            <Col xs="auto" className="d-flex align-items-center">
              <Form.Label htmlFor="itemImage" className="mb-0 me-2">
                Kép
              </Form.Label>
              <Form.Control
                type="file"
                id="itemImage"
                accept="image/*"
                size="sm"
                style={{ maxWidth: "150px" }}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    file: e.target.files?.[0] || null
                  }))
                }
              />
            </Col>
          </Row>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ width: "60%", height: "50vh" }}>
              <canvas
                ref={canvasRef}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <div
              style={{
                width: "40%",
                height: "50vh",
                overflowY: "auto",
                paddingRight: "1rem"
              }}
            >
              <Row className="align-items-center mb-3">
                <Col>
                  <h4>Új Elem Hozzáadása</h4>
                </Col>
                <Col className="text-end">
                  <Button variant="primary" onClick={addItem}>
                    {editingIndex != null ? "Mentés" : "Hozzáadás"}
                  </Button>
                </Col>
              </Row>
              <Form.Group
                as={Row}
                className="mb-3"
                controlId="newItemRefScript"
              >
                <Form.Label column sm={3}>
                  Más terv
                </Form.Label>
                <Col sm={9}>
                  <Form.Select
                    name="refScript"
                    value={newItem.refScript}
                    onChange={(e) => {
                      const sel = e.target.value;
                      const scriptObj = scripts.find(
                        (s) => String(s.scriptId) === sel
                      );
                      const defaults = scriptObj
                        ? parseSettingString(scriptObj.setting)
                        : [];

                      // 1) seed the New‑Item’s own overrides
                      setNewItem((prev) => ({
                        ...prev,
                        refScript: sel,
                        refSettings: defaults.map(({ settingId, value }) => ({
                          settingId,
                          value
                        }))
                      }));

                      // 2) now *also* add any of those defaults into the main script’s settings
                      setParsedSettings((prevSettings) => {
                        const merged = [...prevSettings];
                        defaults.forEach((d) => {
                          if (
                            !merged.some((s) => s.settingId === d.settingId)
                          ) {
                            merged.push(d);
                          }
                        });
                        return merged;
                      });

                      // 3) and update the serialized `script.setting` so it sticks when you save
                      setScript((prev) => {
                        const all = [
                          ...(prev.setting
                            ? parseSettingString(prev.setting)
                            : []),
                          ...defaults
                        ].filter(
                          (s, i, arr) =>
                            arr.findIndex(
                              (x) => x.settingId === s.settingId
                            ) === i
                        );
                        return {
                          ...prev,
                          setting: serializeSettingArray(all)
                        };
                      });
                    }}
                  >
                    <option value="">— none —</option>
                    {scriptList.map((s) => (
                      <option key={s.scriptId} value={s.scriptId}>
                        {s.name} (ID: {s.scriptId})
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Form.Group>

              {newItem.refScript && (
                <Form.Group
                  as={Row}
                  className="mb-3"
                  controlId="newItemRefSettingsList"
                >
                  <Form.Label column sm={3}>
                    Hivatkozott terv beállításai
                  </Form.Label>
                  <Col sm={9}>
                    {refParsedSettings.length === 0 ? (
                      <div className="text-muted">
                        Nincs hozzá rendelhető setting
                      </div>
                    ) : (
                      refParsedSettings.map((ps) => {
                        const override = newItem.refSettings.find(
                          (r) => r.settingId === ps.settingId
                        );
                        return (
                          <InputGroup className="mb-2" key={ps.settingId}>
                            <InputGroup.Text>{ps.name}</InputGroup.Text>
                            <Form.Control
                              type="text"
                              value={override?.value ?? ps.value}
                              onChange={(e) => {
                                const val = e.target.value;
                                setNewItem((prev) => {
                                  const others = prev.refSettings.filter(
                                    (r) => r.settingId !== ps.settingId
                                  );
                                  return {
                                    ...prev,
                                    refSettings: [
                                      ...others,
                                      {
                                        settingId: ps.settingId,
                                        value: val
                                      }
                                    ]
                                  };
                                });
                              }}
                            />
                          </InputGroup>
                        );
                      })
                    )}
                  </Col>
                </Form.Group>
              )}
              {!newItem.refScript && (
                <div>
                  <Row className="mb-3 align-items-center">
                    <Col xs={3}>
                      <Form.Label className="mb-0">Beállítások</Form.Label>
                    </Col>
                    <Col xs="auto">
                      <Form.Check
                        type="checkbox"
                        label="Forgathatóság"
                        className="mb-0"
                        checked={newItem.rotable}
                        onChange={(e) =>
                          setNewItem((prev) => ({
                            ...prev,
                            rotable: e.target.checked
                          }))
                        }
                      />
                    </Col>
                    <Col xs="auto">
                      <Form.Check
                        type="checkbox"
                        label="Iterálás"
                        className="mb-0"
                        checked={autoIterate}
                        onChange={(e) => setAutoIterate(e.target.checked)}
                      />
                    </Col>
                  </Row>

                  <Form.Group as={Row} className="mb-3" controlId="newItemKant">
                    <Form.Label column sm={3}>
                      Kant
                    </Form.Label>
                    <Col sm={3}>
                      <Form.Select
                        value={newItem.kant.slice(1, -1).split(",")[0]}
                        onChange={(e) => {
                          const [, h = "0", s = "0"] =
                            newItem.kant && typeof newItem.kant === "string"
                              ? newItem.kant.slice(1, -1).split(",")
                              : ["-", "0", "0"];
                          setNewItem((prev) => ({
                            ...prev,
                            kant: `[${e.target.value},${h},${s}]`
                          }));
                        }}
                      >
                        {["-", "04", "2", "1", "42"].map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col sm={3}>
                      <Form.Select
                        value={newItem.kant.slice(1, -1).split(",")[1]}
                        onChange={(e) => {
                          const [type = "-", , s = "0"] =
                            newItem.kant && typeof newItem.kant === "string"
                              ? newItem.kant.slice(1, -1).split(",")
                              : ["-", "0", "0"];
                          setNewItem((prev) => ({
                            ...prev,
                            kant: `[${type},${e.target.value},${s}]`
                          }));
                        }}
                      >
                        {[0, 1, 2].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col sm={3}>
                      <Form.Select
                        value={newItem.kant.slice(1, -1).split(",")[2]}
                        onChange={(e) => {
                          const [type = "-", h = "0"] =
                            newItem.kant && typeof newItem.kant === "string"
                              ? newItem.kant.slice(1, -1).split(",")
                              : ["-", "0", "0"];
                          setNewItem((prev) => ({
                            ...prev,
                            kant: `[${type},${h},${e.target.value}]`
                          }));
                        }}
                      >
                        {[0, 1, 2].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Form.Group>
                </div>
              )}

              <Form.Group as={Row} className="mb-3" controlId="newItemQty">
                <Col>
                  <Form.Control
                    type="text"
                    placeholder="Részletek"
                    value={newItem.details}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        material: e.target.value
                      }))
                    }
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="text"
                    placeholder="Anyag"
                    value={newItem.material}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        material: e.target.value
                      }))
                    }
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3" controlId="newItemQty">
                <Form.Label column sm={3}>
                  Darabszám
                </Form.Label>

                <Col sm={5}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      name="qty"
                      value={newItem.qty}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          qty: e.target.value
                        }))
                      }
                      placeholder="kifejezés vagy szám"
                    />
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary">
                        <IonIcon icon={add} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {parsedSettings.map((s) => (
                          <Dropdown.Item
                            key={s.settingId}
                            onClick={() =>
                              setNewItem((prev) => ({
                                ...prev,
                                qty: prev.qty + `(*${s.settingId}*)`
                              }))
                            }
                          >
                            Setting {s.settingId}
                          </Dropdown.Item>
                        ))}
                        {["width", "height", "depth"].map((k) => (
                          <Dropdown.Item
                            key={k}
                            onClick={() =>
                              setNewItem((prev) => ({
                                ...prev,
                                qty: prev.qty + k
                              }))
                            }
                          >
                            {k.charAt(0).toUpperCase() + k.slice(1)}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </InputGroup>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3" controlId="newItemSize">
                <Form.Label column sm={3}>
                  Méretek
                </Form.Label>
                <Col sm={9}>
                  <InputGroup>
                    <Form.Control
                      name="size"
                      value={newItem.size}
                      onChange={handleItemChange}
                      placeholder="w,h,d vagy kifejezés"
                    />
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary">
                        <IonIcon icon={add} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {parsedSettings.map((s) => (
                          <Dropdown.Item
                            key={s.settingId}
                            onClick={() =>
                              setNewItem((prev) => ({
                                ...prev,
                                size: prev.size + `(*${s.settingId}*)`
                              }))
                            }
                          >
                            Beállítás {s.settingId}
                          </Dropdown.Item>
                        ))}
                        {["width", "height", "depth", "qty"].map((k) => (
                          <Dropdown.Item
                            key={k}
                            onClick={() =>
                              setNewItem((prev) => ({
                                ...prev,
                                size: prev.size + k
                              }))
                            }
                          >
                            {k.charAt(0).toUpperCase() + k.slice(1)}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </InputGroup>
                </Col>
              </Form.Group>

              {!autoIterate ? (
                Array.from(
                  { length: parseInt(newItem.qty, 10) || 1 },
                  (_, idx) => idx
                )
                  .reverse()
                  .map((idx) => (
                    <React.Fragment key={idx}>
                      <Form.Group
                        as={Row}
                        className="mb-3"
                        controlId={`pos${idx}`}
                      >
                        <Form.Label column sm={3}>
                          Pozíció #{idx + 1}
                        </Form.Label>
                        <Col sm={9}>
                          <InputGroup>
                            <Form.Control
                              value={newItem.position[idx] ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setNewItem((prev) => {
                                  const ps = [...prev.position];
                                  ps[idx] = val;
                                  return { ...prev, position: ps };
                                });
                              }}
                              placeholder="x,y,z vagy kifejezés"
                            />
                            <Dropdown>
                              <Dropdown.Toggle variant="outline-secondary">
                                <IonIcon icon={add} />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                {parsedSettings.map((s) => (
                                  <Dropdown.Item
                                    key={s.settingId}
                                    onClick={() =>
                                      setNewItem((prev) => {
                                        const ps = [...prev.position];
                                        ps[idx] += `(*${s.settingId}*)`;
                                        return { ...prev, position: ps };
                                      })
                                    }
                                  >
                                    Setting {s.settingId}
                                  </Dropdown.Item>
                                ))}
                                {["width", "height", "depth", "qty"].map(
                                  (k) => (
                                    <Dropdown.Item
                                      key={k}
                                      onClick={() =>
                                        setNewItem((prev) => {
                                          const ps = [...prev.position];
                                          ps[idx] += k;
                                          return { ...prev, position: ps };
                                        })
                                      }
                                    >
                                      {k.charAt(0).toUpperCase() + k.slice(1)}
                                    </Dropdown.Item>
                                  )
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </InputGroup>
                        </Col>
                      </Form.Group>

                      <Form.Group
                        as={Row}
                        className="mb-3"
                        controlId={`rot${idx}`}
                      >
                        <Form.Label column sm={3}>
                          Forgatás #{idx + 1}
                        </Form.Label>
                        <Col sm={9}>
                          <Row>
                            {["X", "Y", "Z"].map((axis, i) => (
                              <Col key={axis}>
                                <Form.Select
                                  value={
                                    newItem.rotation[idx]?.split(",")[i] ?? "0"
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setNewItem((prev) => {
                                      const rs = [...prev.rotation];
                                      const parts = rs[idx]?.split(",") ?? [
                                        "0",
                                        "0",
                                        "0"
                                      ];
                                      parts[i] = val;
                                      rs[idx] = parts.join(",");
                                      return { ...prev, rotation: rs };
                                    });
                                  }}
                                >
                                  <option value="0">0 (0°)</option>
                                  <option value="1">1 (90°)</option>
                                  <option value="2">2 (180°)</option>
                                  <option value="3">3 (270°)</option>
                                </Form.Select>
                              </Col>
                            ))}
                          </Row>
                        </Col>
                      </Form.Group>
                    </React.Fragment>
                  ))
              ) : (
                <>
                  {/* i(start,end), konstans tengelyek egyszerű beviteli mezői */}
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={3}>
                      Pozíció
                    </Form.Label>
                    <Col sm={9}>
                      <Form.Control
                        value={positionDSL}
                        onChange={(e) => setPositionDSL(e.target.value)}
                        placeholder="i(start,end),fixedY,fixedZ"
                      />
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={3}>
                      Forgatás
                    </Form.Label>
                    <Col sm={9}>
                      <Form.Control
                        value={rotationDSL}
                        onChange={(e) => setRotationDSL(e.target.value)}
                        placeholder="fixedX,i(start,end),fixedZ"
                      />
                    </Col>
                  </Form.Group>
                </>
              )}
            </div>
          </div>

          <h4>Beállítások</h4>
          <Button
            variant="secondary"
            className="mb-3"
            onClick={() => setShowSettingModal(true)}
          >
            Beállítás hozzáadása
          </Button>
          <Table bordered striped className="mb-3">
            <thead>
              <tr>
                <th>Azonosító</th>
                <th>Név</th>
                <th>Alapértelmezett Érték</th>
                <th>Törlés</th>
              </tr>
            </thead>
            <tbody>
              {parsedSettings.length === 0 ? (
                <tr>
                  <td colSpan="4">Nincsenek beállítások</td>
                </tr>
              ) : (
                parsedSettings.map((s) => {
                  const name =
                    settingsList.find(
                      (x) => String(x.settingId) === String(s.settingId)
                    )?.name || "";
                  return (
                    <tr
                      key={s.settingId}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setEditingSettingId(s.settingId);
                        setNewSettingPair({ id: s.settingId, value: s.value });
                        setShowSettingModal(true);
                      }}
                    >
                      <td>{s.settingId}</td>
                      <td>{name}</td>
                      <td>{s.value}</td>
                      <td>
                        <IonIcon
                          icon={trash}
                          style={{ cursor: "pointer", color: "red" }}
                          onClick={() => handleRemoveSetting(s.settingId)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>

          <Form onSubmit={handleSubmit}>
            <h4 className="mt-4">Terv elemei</h4>
            <Table bordered striped className="mb-3">
              <thead>
                <tr>
                  <th>Darabszám</th>
                  <th>Név</th>
                  <th>Méretek</th>
                  <th>Pozíció</th>
                  <th>Forgatás</th>
                  <th>Forgathatóság</th>
                  <th>Kant</th>
                  <th>Anyag</th>
                  <th>Szerkesztés</th>
                  <th>Törlés</th>
                  <th>Látható</th>
                </tr>
              </thead>
              <tbody>
                {rawItems.length === 0 ? (
                  <tr>
                    <td colSpan="9">Nincsenek elemek</td>
                  </tr>
                ) : (
                  rawItems.map((it, i) => (
                    <tr key={i}>
                      <td>{it.qty}</td>
                      <td>{it.name}</td>
                      <td>{it.rawSize}</td>
                      <td>{it.rawPosition.map((p) => `[${p}]`).join(", ")}</td>
                      <td>{it.rawRotation.map((r) => `[${r}]`).join(", ")}</td>
                      <td>{it.rotable ? "Fprgatható" : "Nem forgatható"}</td>
                      <td>{it.kant}</td>
                      <td>{it.material || ""}</td>
                      <td>
                        <IonIcon
                          icon={pencil}
                          style={{ cursor: "pointer", marginRight: 8 }}
                          onClick={() => {
                            setEditingItemId(
                              it.itemId > 0 ? it.itemId : it.tempId
                            );
                            setEditingIndex(i);
                            const parsedPositions = it.rawPosition;
                            const parsedRotations = it.rawRotation;
                            setNewItem({
                              qty: it.qty,
                              size: it.rawSize.replace(/^\[|\]$/g, ""),
                              position: parsedPositions,
                              rotation: parsedRotations,
                              // IDE cserélve:
                              refScript: it.refScript
                                ? String(it.refScript)
                                : "",
                              rotable: it.rotable,
                              kant: it.kant || "[-,0,0]",
                              file: null,
                              refSettings: it.refSettings
                                ? parseSettingString(it.refSettings).map(
                                    ({ settingId, value }) => ({
                                      settingId,
                                      value
                                    })
                                  )
                                : [],
                              tempId: it.tempId,
                              itemId: it.itemId
                            });
                          }}
                        />
                      </td>

                      <td>
                        <IonIcon
                          icon={trash}
                          style={{ cursor: "pointer", color: "red" }}
                          onClick={() => handleDeleteItem(it)}
                        />
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => toggleVisibility(it)}
                        >
                          {hiddenItems.has(
                            it.itemId > 0 ? it.itemId : it.tempId
                          )
                            ? "Mutat"
                            : "Elrejt"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Form>

          <Modal
            show={showSettingModal}
            onHide={() => {
              setShowSettingModal(false);
              setEditingSettingId(null);
              setNewSettingPair({ id: "", value: "" });
            }}
            className="custom-backdrop"
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {editingSettingId
                  ? "Beállítás szerkesztése"
                  : "Beállítás hozzáadása"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {/* ID mező szerkesztésnél tiltva */}
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  Azonosító
                </Form.Label>
                <Col sm={9}>
                  <Form.Select
                    value={newSettingPair.id}
                    disabled={!!editingSettingId}
                    onChange={(e) =>
                      setNewSettingPair((p) => ({ ...p, id: e.target.value }))
                    }
                  >
                    <option value="">Válassz Azonosítót</option>
                    {availableSettings.map((s) => (
                      <option key={s.settingId} value={s.settingId}>
                        {s.settingId} – {s.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  Érték
                </Form.Label>
                <Col sm={9}>
                  <Form.Control
                    type="text"
                    value={newSettingPair.value}
                    onChange={(e) =>
                      setNewSettingPair((p) => ({
                        ...p,
                        value: e.target.value
                      }))
                    }
                  />
                </Col>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowSettingModal(false);
                  setEditingSettingId(null);
                  setNewSettingPair({ id: "", value: "" });
                }}
              >
                Mégse
              </Button>
              <Button variant="primary" onClick={saveSettingPair}>
                {editingSettingId ? "Frissítés" : "Hozzáadás"}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}
