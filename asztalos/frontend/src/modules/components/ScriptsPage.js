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
  Image, // Added for image display
  Accordion,
} from "react-bootstrap";
import { IonIcon } from "@ionic/react";
import { pencil, trash, add, copyOutline  } from "ionicons/icons";
import {
  getAllScripts,
  getScriptById,
  getAllSettings,
  getScriptItemsByScript,
} from "../../data/getters";
import scriptApi from "../../data/api/scriptApi";
import scriptItemApi from "../../data/api/scriptItemApi";
import { deleteScriptItem,addScriptItem  } from "../../data/store/actions/scriptStoreFunctions";        
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
  Matrix,
  TransformNode,
} from "@babylonjs/core";

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

  const [positionDSL, setPositionDSL] = useState(""); 
  const [rotationDSL, setRotationDSL] = useState("");



  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditor, setShowEditor] = useState(isEditing);
  const [scriptList, setScriptList] = useState([]);
  const [script, setScript] = useState({ name: "", room: "", setting: "", 
    imageData: null,
    imageContentType: null, });
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
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [userDimensions, setUserDimensions] = useState({
    width: 1000,
    height: 1000,
    depth: 1000,
  });
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [newSettingPair, setNewSettingPair] = useState({ id: "", value: "" });
  const [activeImageKey, setActiveImageKey] = useState(null);

  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  const parseSettingString = (str) =>
    str
      ? str
          .split(",")
          .map((pair) => {
            const [id, val] = pair.split(":");
            return id && val ? { settingId: id, default_value: val } : null;
          })
          .filter(Boolean)
      : [];
  const serializeSettingArray = (arr) =>
    arr.map((s) => `${s.settingId}:${s.default_value}`).join(",");

  const handleDuplicate = async (orig) => {
    try {
      // 1) új script létrehozása
      const cloned = await dispatch(
        scriptApi.createScriptApi({
          name: `${orig.name} (Másolat)`,
          room: orig.room,
          setting: orig.setting,
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
          })
        );
          const normalized = {
          itemId: created.itemId,
          scriptId: created.scriptId,
          // plusz minden egyéb mező, ami kell a renderhez:
          qty:     created.qty,
          size:    created.size,
          position: created.position,
          rotation: created.rotation,
          refScript: created.refScriptId,
          refSettings: created.refSettings,
          name:    created.name,
          kant:    created.kant,
          rotable: created.rotable,
        };

        // és dispatch-eld rögtön a store-ba
        dispatch(addScriptItem(normalized));
      }
      dispatch(getScriptItemsByScript(cloned.scriptId));      
      
      // 4) lista frissítése
      await dispatch(getAllScripts());
    } catch (err) {
      console.error("Duplikálás hiba:", err);
      alert("Hiba a duplikálás során");
    }
  };
 /*
  const evalArr = (raw, overrideSettings = null, overrideDims = null) => {
  const settingsToUse = overrideSettings || parsedSettings;
  const { width, height, depth } = overrideDims
    ? { width: overrideDims[0], height: overrideDims[1], depth: overrideDims[2] }
    : userDimensions;

  // ha már tömb, maradjon a régi logika
  if (Array.isArray(raw)) {
    return raw.map(v => Number(v) || 0).slice(0,3);
  }
  const str = String(raw || "").trim();
  // ha benne van a 'i(start,end)' makró, ne próbáljuk meg JS-en kiértékelni
    if (/\bi\(\s*[+-]?\d+\s*,\s*[+-]?\d+\s*\)/.test(str)) {
      return [0,0,0];
     }

  if (!str.startsWith("[")) return [0,0,0];

  // 1) behelyettesítjük a változókat (width/height/depth és a setting-ek értékeit)
  const jsExpr = str
    .replace(/\bwidth\b/g, width)
    .replace(/\bheight\b/g, height)
    .replace(/\bdepth\b/g, depth)
    .replace(/\(\*(\d+)\*\)/g, (_, id) => {
      const s = settingsToUse.find(x => String(x.settingId) === id);
      return s ? s.default_value : "0";
    });

  // 2) közvetlen JS-eval: támogatja a ? : operátort, logikai kifejezéseket, beágyazott függvényhívásokat stb.
  try {
    const result = new Function(`return ${jsExpr}`)();
    if (Array.isArray(result)) {
      // csak az első három komponensre van szükség
      return result.slice(0,3).map(v => Number(v) || 0);
    }
  } catch (err) {
    console.error("evalArr hiba:", err);
  }
  return [0,0,0];
};*/

const evalArr = (raw, overrideSettings = null, overrideDims = null) => {
  const settingsToUse = overrideSettings || parsedSettings;
  const { width, height, depth } = overrideDims
    ? { width: overrideDims[0], height: overrideDims[1], depth: overrideDims[2] }
    : userDimensions;

  // ha már tömb, tartsuk meg a korábbi viselkedést
  if (Array.isArray(raw)) {
    return raw.map(v => Number(v) || 0).slice(0,3);
  }
  const str = String(raw || "").trim();

  // ha interpolációs makrót látunk, visszaadunk egy üres placeholder-t
  if (/\bi\(\s*[+-]?\d+\s*,\s*[+-]?\d+\s*\)/.test(str)) {
    return [0,0,0];
  }

  // nem is [ … ], szóval nincs mit kiértékelni
  if (!str.startsWith("[") || !str.endsWith("]")) {
    return [0,0,0];
  }

  // szedjük ki a belsejét: pl "[1+width, (*3*), 20]" → "1+width, (*3*), 20"
  const inner = str.slice(1, -1);

  // bontsuk fel vesszőn át top-levelben
  const parts = [];
  let depthPar = 0, last = 0;
  for (let i = 0; i < inner.length; i++) {
    if (inner[i] === "(") depthPar++;
    else if (inner[i] === ")") depthPar--;
    else if (inner[i] === "," && depthPar === 0) {
      parts.push(inner.slice(last, i).trim());
      last = i + 1;
    }
  }
  parts.push(inner.slice(last).trim());

  // most minden tengelyre:
return parts.slice(0, 3).map(expr0 => {
  // 1) trimeljük a whitespace-eket
  let expr = expr0.trim();

  // 2) töröljük az elején vagy végén álló '[' és ']' karaktereket
  expr = expr.replace(/^[\[\]]+|[\[\]]+$/g, "");

  // 3) ha üres, visszaadunk 0-t
  if (!expr) {
    return 0;
  }

  // 4) helyettesítések és JS-eval ugyanúgy, mint eddig
  let js = expr
    .replace(/\bwidth\b/g, width)
    .replace(/\bheight\b/g, height)
    .replace(/\bdepth\b/g, depth)
    .replace(/\(\*(\d+)\*\)/g, (_, id) => {
      const s = settingsToUse.find(x => String(x.settingId) === id);
      return s ? s.default_value : "0";
    });

  try {
    const val = new Function(`return (${js})`)();
    return Number(val) || 0;
  } catch (err) {
    console.error("evalArr hiba:", err, "expr:", expr);
    return 0;
  }
});
};


function expandIterated(rawParts, count, parentSettings, parentSize) {
  // 1) legyen legalább 3 tengely
  const parts = rawParts.slice();
  while (parts.length < 3) parts.push("0");

  // 2) ha bármelyik tengely makró, akkor a konstansokat is 'i(val,val)'-re cseréljük
  const hasMacro = parts.some(p => /\bi\(\s*[+-]?\d+\s*,\s*[+-]?\d+\s*\)/.test(p));
  const normParts = parts.map(p => {
    return hasMacro && !/\bi\(/.test(p)
      ? `i(${p.trim()},${p.trim()})`
      : p;
  });

  // 3) tengelyenkénti sorozatok
  const axes = normParts.map(part => {
    const m = part.match(/^i\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*\)$/);
    if (m) {
      // interpoláló makró
      const start = +m[1], end = +m[2];
      if (count === 1) return [start];
      const step = (end - start) / (count - 1);
      return Array.from({ length: count }, (_, i) => start + step * i);
    }
    // konstans tengely: JS-eval, majd ismételjük count-szor
    const val = evalArr(`[${part}]`, parentSettings, parentSize)[0] || 0;
    return Array(count).fill(val);
  });

  // 4) összeállítjuk az [x,y,z] tömböt minden darabhoz
  const res = Array.from({ length: count }, (_, i) => [
    axes[0][i],
    axes[1][i],
    axes[2][i]
  ]);

  return res;
}




function extractRawList(str) {
  if (!str) return [];
  // először keresünk sima [x,y,z] párokat
  const bracketMatches = String(str).match(/\[([^\]]+)\]/g);
  if (bracketMatches && bracketMatches.length) {
    return bracketMatches.map(m => m.slice(1, -1).trim());
  }
  // ha nincs [], akkor visszaadjuk a teljes stringet (pl. "i(0,10),0,0")
  return [String(str).trim()];
}


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
            imageContentType: s.imageContentType || null,
          });

          setParsedSettings(
            s.setting ? s.setting.split(",").map((p) => p) : []
          );
            if (s.setting) {
              setParsedSettings(parseSettingString(s.setting));
            }

          await dispatch(getScriptItemsByScript(scriptId));
        }
      } catch (err) {
        console.error("[useEffect fetchData] HIBA:", err);
        setError("Hiba az adatok betöltésekor");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, scriptId, isEditing]);

  useEffect(() => setScriptList(scripts), [scripts]);

  const refParsedSettings = useMemo(() => {
    if (!newItem.refScript) return [];
    const parent = scripts.find(
      (s) => String(s.scriptId) === String(newItem.refScript)
    );
    return parent
      ? parseSettingString(parent.setting || "")
      : [];
  }, [newItem.refScript, scripts]);

  
const rawItems = useMemo(() => {
  const deleted = pendingItems
    .filter(it => it.itemId === -1)
    .map(it => it.originalItemId)
    .filter(Boolean);

  const pendingIds = pendingItems
    .filter(it => it.itemId !== -1)
    .map(it => it.itemId)
    .filter(id => id !== -1);

  const kept = scriptItems.filter(
    it => !deleted.includes(it.itemId) && !pendingIds.includes(it.itemId)
  );

  // Csak az újak (tempId) és a létezők frissítései (itemId > 0)
  const additions = pendingItems.filter(
    it => it.tempId !== undefined || it.itemId !== -1
  );

  return [...kept, ...additions].map(it => ({
    ...it,
    isPending: it.tempId != null,  
    rawSize: it.size,
    rawPosition: extractRawList(it.position),
    rawRotation: extractRawList(it.rotation),
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
    () => Object.fromEntries(parsedSettings.map(s => [s.settingId, Number(s.default_value)])),
    [parsedSettings]
  );

  const computedQty = useMemo(() => {
    const raw = String(newItem.qty).trim() || "1";
    const arr = evalArr(`[${raw}]`, settingsObj);
    return Math.max(1, Math.round(arr[0]));
  }, [newItem.qty, settingsObj]);


  function splitTopLevel(str) {
  const parts = [];
  let depth = 0, last = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "(") depth++;
    else if (str[i] === ")") depth--;
    else if (str[i] === "," && depth === 0) {
      parts.push(str.slice(last, i).trim());
      last = i + 1;
    }
  }
  parts.push(str.slice(last).trim());
  return parts;
}

const processedItems = useMemo(() => {
  const byScript = allScriptItems.reduce((acc, it) => {
    acc[it.scriptId] = acc[it.scriptId] || [];
    acc[it.scriptId].push(it);
    return acc;
  }, {});

function expandItem(item, parentSettings, parentSize) {
  console.log("item: ", item)
  const size = evalArr(item.size, parentSettings, parentSize);
  let rawPos = splitTopLevel(item.position.replace(/^\[|\]$/g, ""));
  let rawRot = splitTopLevel(item.rotation.replace(/^\[|\]$/g, ""));
  const n    = Number(item.qty) ||1;

  const posIsMacro = rawPos.some(s => /\bi\(/.test(s));
  const rotIsMacro = rawRot.some(s => /\bi\(/.test(s));
  let relPositions, relRotations;

  if (posIsMacro || rotIsMacro) {
    // ha van i(...) makró, akkor interpolálunk
    relPositions = expandIterated(rawPos, n, parentSettings, parentSize);
    relRotations = expandIterated(rawRot, n, parentSettings, parentSize);
  } else {
    // sima [x,y,z] sorozat
    relPositions = parseBracketExprList(item.position, expr =>
      evalArr(expr, parentSettings, parentSize)
    );
    relRotations = parseBracketExprList(item.rotation, expr =>
      evalArr(expr, parentSettings, parentSize)
    );

    // – ha kevesebb koordináta érkezett, mint amennyi qty, duplikáljuk
    if (relPositions.length < n) {
      const first = relPositions[0] || [0,0,0];
      relPositions = Array.from({ length: n }, () => first);
    }
    if (relRotations.length < n) {
      const first = relRotations[0] || [0,0,0];
      relRotations = Array.from({ length: n }, () => first);
    }
  }

  /*
  // 2) choose expansion
  const relPositions = (posIsMacro || rotIsMacro)
    ? expandIterated(rawPos, n, parentSettings, parentSize)
    : parseBracketExprList(item.position, expr => evalArr(expr, parentSettings, parentSize));

  const relRotations = (posIsMacro || rotIsMacro)
    ? expandIterated(rawRot, n, parentSettings, parentSize)
    : parseBracketExprList(item.rotation, expr => evalArr(expr, parentSettings, parentSize));
*/
    


  const pivot = new Vector3(size[0] / 2, size[1] / 2, size[2] / 2);

  if (!item.refScript) {
  return relPositions.map((pos, idx) => ({
    ...item,
    qty: 1,                              // egy darab az adott példány
    evaluatedSize: size,
    evaluatedPosition: [pos],           // egyetlen pozíció‐tömb
    evaluatedRotation: [relRotations[idx] || [0,0,0]]
  }));
  }

  // Ha van refScript, rekurzívan bejárjuk a gyerekeket és transzformáljuk őket
  const children        = byScript[item.refScript] || [];
  const defaultSettings = parseSettingString(item.refSettings);
  const instances = [];

  relPositions.forEach((pPos, idx) => {
    const pRot  = relRotations[idx] || [0, 0, 0];
    const pQuat = Quaternion.RotationYawPitchRoll(
      pRot[1] * Math.PI / 2,
      pRot[0] * Math.PI / 2,
      pRot[2] * Math.PI / 2
    );
    const pMat = Matrix.Identity();
    pQuat.toRotationMatrix(pMat);

    children.forEach(child => {
      const adds = expandItem(child, defaultSettings, size);
      adds.forEach(inst => {
        // Pozíció transzformáció
        inst.evaluatedPosition = inst.evaluatedPosition.map(([x, y, z]) => {
          const v0 = new Vector3(x, y, z).subtract(pivot);
          const v1 = Vector3.TransformCoordinates(v0, pMat);
          const v2 = v1.add(pivot).add(new Vector3(...pPos));
          return [v2.x, v2.y, v2.z];
        });
        // Rotáció transzformáció
        inst.evaluatedRotation = inst.evaluatedRotation.map(([cx, cy, cz]) => {
          const cQuat = Quaternion.RotationYawPitchRoll(
            cy * Math.PI / 2,
            cx * Math.PI / 2,
            cz * Math.PI / 2
          );
          const combo = pQuat.multiply(cQuat).toEulerAngles();
          return [
            Math.round(combo.x / (Math.PI / 2)) % 4,
            Math.round(combo.y / (Math.PI / 2)) % 4,
            Math.round(combo.z / (Math.PI / 2)) % 4,
          ];
        });
        instances.push(inst);
      });
    });
  });

  return instances;
}
let all = [];


   rawItems.forEach(raw => {
     // always use the raw position/rotation arrays and raw qty
     all.push(
       ...expandItem(
         raw,                                      // <-- no autoIterate override here
         parsedSettings,
         [userDimensions.width, userDimensions.height, userDimensions.depth],
         raw.qty                                   // <-- always the raw qty
       )
     );
   });

  const seen = new Set();
  return all.filter(inst => {
    const key = inst.itemId + '|' + JSON.stringify(inst.evaluatedPosition);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}, [rawItems, allScriptItems, parsedSettings, userDimensions]);

useEffect(() => {
}, [processedItems]);
  
  function parseBracketExprList(input, evalArrFn) {
    if (Array.isArray(input)) {
      return input.map((item) => {
        const coords = evalArrFn(item);
        return coords;
      });
    }
    const str = String(input || "");
    const matches = str.match(/\[[^\]]*\]/g) || [];
    return matches.map((expr) => {
      const coords = evalArrFn(expr);
      return coords;
    });
  }

function evaluateFormula(formula, settingsObj) {
  // 1) stringgé alakítjuk és trimeljük
  let expr = String(formula).trim();

  // 2) levágjuk az esetleges végződő + - * / vagy szóközöket
  expr = expr.replace(/[+\-*/\s]+$/, "");

  // 3) (*id*) makrók cseréje
  expr = expr.replace(/\(\*(\d+)\*\)/g, (_, id) =>
    String(settingsObj[id] != null ? settingsObj[id] : 0)
  );

  // 4) width/height/depth változók cseréje
  expr = expr.replace(/\b(width|height|depth)\b/g, (_, v) =>
    String(settingsObj[v] != null ? settingsObj[v] : 0)
  );

  return expr;
}



  const handleScriptChange = (e) =>
    setScript((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleDimensionChange = (e) =>
    setUserDimensions((prev) => ({
      ...prev,
      [e.target.name]: Number(e.target.value),
    }));
  const handleItemChange = (e) =>
    setNewItem((prev) => ({ ...prev, [e.target.name]: e.target.value }));

const addItem = () => {
  // Beállítjuk a settings objektumot
    console.log(">>> addItem called");
  console.log("   newItem:", newItem);
  console.log("   newItem.position:", newItem.position);
  const settingsObj = Object.fromEntries(
    parsedSettings.map(s => [s.settingId, Number(s.default_value)])
  );

  // Kiértékeljük a qty kifejezést
  const qtyExpr = evaluateFormula(newItem.qty, settingsObj);
  const q = Number(new Function(`return (${qtyExpr})`)());
  if (isNaN(q) || q < 1) {
    return alert("A mennyiség minimum 1 kell legyen.");
  }

  // Kant előkészítése
  let [kantType, hkant, skant] = (newItem.kant || "[-,0,0]")
    .slice(1, -1)
    .split(",");
  if (kantType === "-") {
    hkant = "0";
    skant = "0";
  }
  const kantString = `[${kantType},${hkant},${skant}]`;

  // Megnézzük, van-e i(...) makró
  const hasPosMacro = newItem.position.some(s => /\bi\(/.test(s));
  const hasRotMacro = newItem.rotation.some(s => /\bi\(/.test(s));
/*
  const posField = hasPosMacro
    ? newItem.position.join(",")
    : newItem.position.map(p => `[${p}]`).join(",");

  const rotField = hasRotMacro
    ? newItem.rotation.join(",")
    : newItem.rotation.map(r => `[${r}]`).join(",");*/

    /***************************** */
   const posField = autoIterate
     ? positionDSL
     : newItem.position
         .map(p => (p.trim() ? `[${p}]` : "[0,0,0]"))
         .join(",");

   const rotField = autoIterate
     ? rotationDSL
     : newItem.rotation
         .map(r => (r.trim() ? `[${r}]` : "[0,0,0]"))
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
    itemId: newItem.itemId || -1,
  };

  // Betesszük a pendingItems-be (szerkesztés vagy újdonság kezelése)
  setPendingItems(prev => {
    if (editingIndex !== null && rawItems[editingIndex]) {
      const original = rawItems[editingIndex];
      const idx = prev.findIndex(p =>
        p.itemId === original.itemId || p.tempId === original.tempId
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
  setNewItem(prev => ({
    qty: 1,
    size: "",
    position: [""],
    rotation: ["0,0,0"],
    rotable: false,
    kant: "[-,0,0]",
    file: null,
    refScript: prev.refScript,
    refSettings: prev.refSettings,
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
      setting: script.setting,
    };

    try {
      let usedScriptId = scriptId;


      if (isEditing) {
        try {
          await dispatch(
            scriptApi.updateScriptApi(
              { script_id: scriptId, ...scriptData },
              newItem
            )
          );
        } catch (err) {
          if (!(err.status === 400 && err.data?.message.includes("no changes"))) {
            throw err;
          }
        }
      } else {
        const newS = await dispatch(scriptApi.createScriptApi(scriptData));
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
              rotable: it.rotable,
            })
          );
        } else {
          console.log("New item data:", 
            {
              script_id: usedScriptId,
              qty: it.qty,
              size: it.size,
              position: posStr,
              rotation: rotStr,
              refScript: it.refScript,
              refSettings: it.refSettings,
              name: it.name,
              kant: it.kant,
              rotable: it.rotable,
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
                rotable: it.rotable,
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
      console.error("Hiba a mentés közben:", err);
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
      default_value: String(value),
    };
    const updated = [...parsedSettings, newEntry];
    setParsedSettings(updated);
    setScript((prev) => ({
      ...prev,
      setting: serializeSettingArray(updated),
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

    engine.runRenderLoop(() => scene.render());
    return () => engine.dispose();
  }, [showEditor, loading]);
/********************************************* */
useEffect(() => {
  console.log("Modellnek átadott elemek:", processedItems);

  const scene = sceneRef.current;
  if (!scene) return;

  // régi meshek törlése (kivéve a floor-t)
  scene.meshes
    .filter((m) => m.name !== "floor")
    .forEach((m) => m.dispose());

  const { width, height, depth } = userDimensions;
  const maxDim = Math.max(width, height, depth) || 1;
  const globalScale = 1 / maxDim;

  processedItems.forEach((it, idx) => {
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

      // a pivot a bal-felső-első (front) sarok lesz a középponthoz képest:
      
      box.setPivotPoint(new Vector3(-sw / 2, -sh / 2, -sd / 2));
      box.position = new Vector3(px + sw / 2, py + sh / 2, pz + sd / 2);

      // forgatás a pivot körül
      box.rotation = new Vector3(
        rawRot[0] * Math.PI / 2,
        rawRot[1] * Math.PI / 2,
        rawRot[2] * Math.PI / 2
      );

      const mat = new StandardMaterial(`mat_${idx}_${j}`, scene);
      mat.diffuseColor = new Color3(0.3, 0.3, 0.3);
      box.material = mat;
    }
  });
}, [processedItems, userDimensions, parsedSettings]);


  if (loading) return <Loading />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const availableSettings = settingsList.filter(
    (s) =>
      !parsedSettings.some(
        (ps) => Number(ps.settingId) === Number(s.settingId)
      )
  );

  const handleRemoveSetting = async (id) => {
    const updated = parsedSettings.filter(
      (s) => String(s.settingId) !== String(id)
    );
    setParsedSettings(updated);
    setScript((prev) => ({
      ...prev,
      setting: serializeSettingArray(updated),
    }));
    if (isEditing) {
      try {
        await dispatch(
          scriptApi.updateScriptApi(
            {
              script_id: scriptId,
              name: script.name,
              room: script.room,
              setting: serializeSettingArray(updated),
            },
            newItem.file
          )
        );
      } catch (err) {
        console.error("Hiba a setting törlése közben:", err);
      }
    }
  };

  const handleDeleteItem = (item) => {
    if (item.itemId > 0) {
      setPendingItems((prev) => [
        ...prev,
        { originalItemId: item.itemId, itemId: -1 },
      ]);
    } else {
      setPendingItems((prev) => prev.filter((p) => p.tempId !== item.tempId));
    }
  };

  return (
    <div className="container">
      <h1>Scriptek</h1>

      {!showEditor ? (
        <>
          <Button className="mb-3" onClick={() => setShowEditor(true)}>
            Új Script Létrehozása
          </Button>
          <div style={{ maxHeight: "80vh", overflowY: "auto", border: "1px solid #ddd", borderRadius: "4px" }}> 
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Név</th>
                  <th>Room</th>
                  <th>Műveletek</th>
                </tr>
              </thead>
              <tbody>
                {scriptList.length === 0 ? (
                  <tr>
                    <td colSpan="4">Nincsenek scriptek</td>
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
              <h2>{isEditing ? "Edit script" : "Új script"}</h2>
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>Name</InputGroup.Text>
                <Form.Control
                  name="name"
                  value={script.name}
                  onChange={handleScriptChange}
                  placeholder="Script Név"
                  required
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>Room</InputGroup.Text>
                <Form.Control
                  name="room"
                  value={script.room}
                  onChange={handleScriptChange}
                  placeholder="Room"
                  required
                />
              </InputGroup>
            </Col>
            <Col md="auto">
              <Button variant="secondary" onClick={() => setShowEditor(false)}>
                Mégse
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
                onSelect={key => setActiveImageKey(key === activeImageKey ? null : key)}
                className="mb-3"
              >
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Script Kép</Accordion.Header>
                  <Accordion.Body style={{ textAlign: 'center' }}>
                    {isEditing ? (
                      <Image
                        src={`data:${script.imageContentType};base64,${script.imageData}`}
                        alt="Script image"
                        thumbnail
                        fluid
                        style={{ maxHeight: 300 }}
                      />
                    ) : (
                      <span className="text-muted">Szerkesztéskor itt fog megjelenni a kép</span>
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
                    {dim.charAt(0).toUpperCase() + dim.slice(1)}
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
                    file: e.target.files?.[0] || null,
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
            <div style={{ width: "40%", height: "50vh", overflowY: "auto" }}>
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
              <Form.Group as={Row} className="mb-3" controlId="newItemRefScript">
                <Form.Label column sm={3}>
                  Ref Script
                </Form.Label>
                <Col sm={9}>
                <Form.Select
                    name="refScript"
                    value={newItem.refScript}
                    onChange={(e) => {
                      const sel = e.target.value;
                      // keresd meg a script objektumot
                      const scriptObj = scripts.find((s) => String(s.scriptId) === sel);
                      // parse-eld ki a default setting párokat
                      const defaults = scriptObj
                        ? parseSettingString(scriptObj.setting || "")
                        : [];
                      setNewItem((prev) => ({
                        ...prev,
                        refScript: sel,
                        // inicializáld a tömböt default_value-kkel
                        refSettings: defaults.map(({ settingId, default_value }) => ({
                          settingId,
                          default_value,
                        })),
                      }));
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

              { newItem.refScript && (
                <Form.Group
                  as={Row}
                  className="mb-3"
                  controlId="newItemRefSettingsList"
                >
                  <Form.Label column sm={3}>
                    Ref Settings
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
                          <InputGroup.Text>{ps.settingId}</InputGroup.Text>
                          <Form.Control
                            type="text"
                            value={override?.value ?? ps.default_value}
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
                                    { settingId: ps.settingId, default_value: val },
                                  ],
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
              <Form.Group as={Row} className="mb-3" controlId="newItemQty">
                
                <Form.Label column sm={3}>
                  Qty
                </Form.Label>

                <Col sm={5}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      name="qty"
                      value={newItem.qty}
                      onChange={(e) =>
                        setNewItem((prev) => ({ ...prev, qty: e.target.value }))
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
                                qty: prev.qty + `(*${s.settingId}*)`,
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
                                qty: prev.qty + k,
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
              <Form.Group as={Row} className="mb-3" controlId="rotable">
                <Col xs="auto" className="d-flex align-items-center">
                  <Form.Label className="mb-0 me-5">Rotable</Form.Label>
                  <Form.Check
                    type="checkbox"
                    checked={newItem.rotable}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        rotable: e.target.checked,
                      }))
                    }
                  />
                  <Form.Check 
                  type="switch"
                  id="auto-iterate-toggle"
                  label="Auto-iterate"
                  checked={autoIterate}
                  onChange={e => setAutoIterate(e.target.checked)}
                />
                </Col>

              </Form.Group>

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
                        kant: `[${e.target.value},${h},${s}]`,
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
                        kant: `[${type},${e.target.value},${s}]`,
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
                        kant: `[${type},${h},${e.target.value}]`,
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
              <Form.Group as={Row} className="mb-3" controlId="newItemSize">
                <Form.Label column sm={3}>
                  Size
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
                                size: prev.size + `(*${s.settingId}*)`,
                              }))
                            }
                          >
                            Setting {s.settingId}
                          </Dropdown.Item>
                        ))}
                        {["width", "height", "depth", "qty"].map((k) => (
                          <Dropdown.Item
                            key={k}
                            onClick={() =>
                              setNewItem((prev) => ({
                                ...prev,
                                size: prev.size + k,
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

              {!autoIterate
                ?  Array.from(
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
                        Position #{idx + 1}
                      </Form.Label>
                      <Col sm={9}>
                        <InputGroup>
                        <Form.Control
                            value={newItem.position[idx] ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewItem((prev) => {
                                console.log("➤ position onChange:", idx, val);
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
                              {["width", "height", "depth", "qty"].map((k) => (
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
                              ))}
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
                        Rotation #{idx + 1}
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
                                  const parts = rs[idx]?.split(",") ?? ["0", "0", "0"];
                                  parts[i] = val;
                                  rs[idx] = parts.join(",");
                                  return { ...prev, rotation: rs };
                                });
                              }}
                            >
                              <option value="0">0 (0°)</option>
                              <option value="1">1 (90°)</option>
                            </Form.Select>
                            </Col>
                          ))}
                        </Row>
                      </Col>
                    </Form.Group>
                  </React.Fragment>
                )): (
                  <>
                    {/* i(start,end), konstans tengelyek egyszerű beviteli mezői */}
                    <Form.Group as={Row} className="mb-3">
                      <Form.Label column sm={3}>Position</Form.Label>
                      <Col sm={9}>
                        <Form.Control
                          value={positionDSL}
                          onChange={e => setPositionDSL(e.target.value)}
                          placeholder="i(start,end),fixedY,fixedZ"
                        />
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                      <Form.Label column sm={3}>Rotation</Form.Label>
                      <Col sm={9}>
                        <Form.Control
                          value={rotationDSL}
                          onChange={e => setRotationDSL(e.target.value)}
                          placeholder="fixedX,i(start,end),fixedZ"
                        />
                      </Col>
                    </Form.Group>
                  </>
                )}
            </div>
          </div>

          <h4>Setting párok</h4>
          <Button
            variant="secondary"
            className="mb-3"
            onClick={() => setShowSettingModal(true)}
          >
            Add Setting
          </Button>
          <Table bordered striped className="mb-3">
            <thead>
              <tr>
                <th>ID</th>
                <th>Név</th>
                <th>Default Érték</th>
                <th>Törlés</th>
              </tr>
            </thead>
            <tbody>
              {parsedSettings.length === 0 ? (
                <tr>
                  <td colSpan="4">Nincsenek settingek</td>
                </tr>
              ) : (
                parsedSettings.map((s) => {
                  const name =
                    settingsList.find(
                      (x) => String(x.settingId) === String(s.settingId)
                    )?.name || "";
                  return (
                    <tr key={s.settingId}>
                      <td>{s.settingId}</td>
                      <td>{name}</td>
                      <td>{s.default_value}</td>
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
            <h4 className="mt-4">Script Elemek</h4>
            <Table bordered striped className="mb-3">
              <thead>
                <tr>
                  <th>Qty</th>
                  <th>Size</th>
                  <th>Position</th>
                  <th>Rotation</th>
                  <th>Rotable</th>
                  <th>Kant</th>
                  <th>Szerkesztés</th>
                  <th>Törlés</th>
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
                      <td>{it.rawSize}</td>
                      <td>{it.rawPosition.map((p) => `[${p}]`).join(", ")}</td>
                      <td>{it.rawRotation.map((r) => `[${r}]`).join(", ")}</td>
                      <td>{it.rotable ? "Yes" : "No"}</td>
                      <td>{it.kant}</td>
                      <td>
                      <IonIcon
                        icon={pencil}
                        style={{ cursor: "pointer", marginRight: 8 }}
                        onClick={() => {
                          setEditingIndex(i);
                          const parsedPositions = it.rawPosition;
                          const parsedRotations = it.rawRotation;
                          setNewItem({
                            qty: it.qty,
                            size: it.rawSize.replace(/^\[|\]$/g, ""),
                            position: parsedPositions,
                            rotation: parsedRotations,
                            // IDE cserélve:
                            refScript: it.refScript ? String(it.refScript) : "",
                            rotable: it.rotable,
                            kant: it.kant || "[-,0,0]",
                            file: null,
                            refSettings: it.refSettings
                            ? parseSettingString(it.refSettings).map(({ settingId, default_value }) => ({
                                settingId,
                                default_value,
                              }))
                            : [],
                            tempId: it.tempId,
                            itemId: it.itemId,
                          });
                        }}
                      />
                      </td>
                      <td>
                        <IonIcon
                          icon={trash}
                          style={{ cursor: "pointer", color: "red" }}
                              onClick={async () => {
                             // eltávolítjuk a sorból
                             handleDeleteItem(it);
                             
                           }}
                         />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Form>

          <Modal
            show={showSettingModal}
            onHide={() => setShowSettingModal(false)}
            className="custom-backdrop"
          >
            <Modal.Header closeButton>
              <Modal.Title>Add Setting</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  ID
                </Form.Label>
                <Col sm={9}>
                  <Form.Select
                    value={newSettingPair.id}
                    onChange={(e) =>
                      setNewSettingPair((p) => ({
                        ...p,
                        id: e.target.value,
                      }))
                    }
                  >
                    <option value="">Válassz ID-t</option>
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
                        value: e.target.value,
                      }))
                    }
                  />
                </Col>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowSettingModal(false)}
              >
                Mégse
              </Button>
              <Button variant="primary" onClick={addSettingPair}>
                Hozzáadás
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}
