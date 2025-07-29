import store from "../../data/store/store";
import { Quaternion } from "@babylonjs/core";
import {
  evalArr as baseEvalArr,
  expandIterated,
  splitTopLevel,
  extractRawList,
  parseConditionalPosition
} from "../../modules/components/scriptsPageutil/evalArr";

function evaluateFormula(formula, settings) {
  return (
    formula
      // (*id*) makrók: ha a beillesztendő érték nem szám, JSON.stringify-eljük,
      // így idézőjelek között kerül bele.
      .replace(/\(\*(\d+)\*\)/g, (_, id) => {
        const val = settings[id] != null ? settings[id] : 0;
        return typeof val === "number" ? val : JSON.stringify(val);
      })
      // width/height/depth változók kezelése ugyanígy
      .replace(/\b(width|height|depth)\b/g, (_, v) => {
        const dim = settings[v] != null ? settings[v] : 0;
        return typeof dim === "number" ? dim : JSON.stringify(dim);
      })
  );
}

function parseBracketedArrays(str) {
  // 1) Távolítsuk el a külső idézőjeleket
  if (
    (str.startsWith(`"`) && str.endsWith(`"`)) ||
    (str.startsWith(`'`) && str.endsWith(`'`))
  ) {
    str = str.slice(1, -1);
  }

  // 2) Teljes ternary JS-eval
  if (str.includes("?")) {
    try {
      let expr = str.trim();
      if (expr.startsWith("[") && expr.endsWith("]")) {
        expr = expr.slice(1, -1);
      }
      const result = new Function(`return (${expr});`)();
      // Ha nested tömb, akkor egyből visszaadjuk
      if (Array.isArray(result[0])) {
        const mapped = result.map((r) => r.map((v) => Number(v) || 0));
        return mapped;
      } else {
        const single = [result.map((v) => Number(v) || 0)];
        return single;
      }
    } catch (err) {
      return [];
    }
  }

  // 3) Ha a teljes str dupla-nested, próbáljuk meg egyszerre JS-eval-lel
  const trimmed = str.trim();
  if (trimmed.startsWith("[[") && trimmed.endsWith("]]")) {
    try {
      const result = new Function(`return ${trimmed};`)();
      if (Array.isArray(result) && Array.isArray(result[0])) {
        const mapped = result.map((r) => r.map((v) => Number(v) || 0));
        return mapped;
      }
    } catch (err) {
      console.error(
        "   ❌ parseBracketedArrays full-nested hiba:",
        err,
        trimmed
      );
      // esés tovább a regex-re
    }
  }

  // 4) Végül jöhet a sima regexes [x,y,z] kigyűjtés
  const arrays = [];
  const bracketRegex = /\[([^\]]+)\]/g;
  let match;
  while ((match = bracketRegex.exec(str)) !== null) {
    try {
      const result = new Function(`return ${match[0]};`)();
      if (Array.isArray(result)) {
        const row = result.slice(0, 3).map((v) => Number(v) || 0);
        arrays.push(row);
      } else {
      }
    } catch (err) {
      console.error("   ❌ parseBracketedArrays eval hiba for", match[0], err);
    }
  }

  return arrays;
}

function parseSettingString(str) {
  return str
    ? str
        .split(",")
        .map((p) => {
          const [id, val] = p.split(":");
          return id && val ? { settingId: id, value: val } : null;
        })
        .filter(Boolean)
    : [];
}

function quatMul(a, b) {
  const [ax, ay, az, aw] = a,
    [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz
  ];
}
function quatConjugate([x, y, z, w]) {
  return [-x, -y, -z, w];
}
function eulerUnitToQuat([ux, uy, uz]) {
  const pitch = ux * (Math.PI / 2),
    yaw = uy * (Math.PI / 2),
    roll = uz * (Math.PI / 2);
  const cy = Math.cos(yaw / 2),
    sy = Math.sin(yaw / 2);
  const cp = Math.cos(pitch / 2),
    sp = Math.sin(pitch / 2);
  const cr = Math.cos(roll / 2),
    sr = Math.sin(roll / 2);
  const qYaw = [0, sy, 0, cy];
  const qPitch = [sp, 0, 0, cp];
  const qRoll = [0, 0, sr, cr];
  return quatMul(quatMul(qYaw, qPitch), qRoll);
}
function quatToEulerUnit(q) {
  const [x, y, z, w] = q;
  const sinr = 2 * (w * x + y * z),
    cosr = 1 - 2 * (x * x + y * y);
  const roll = Math.atan2(sinr, cosr);
  let sinp = 2 * (w * y - z * x);
  sinp = Math.max(-1, Math.min(1, sinp));
  const pitch = Math.asin(sinp);
  const siny = 2 * (w * z + x * y),
    cosy = 1 - 2 * (y * y + z * z);
  const yaw = Math.atan2(siny, cosy);
  return [
    Math.round(roll / (Math.PI / 2)) % 4,
    Math.round(pitch / (Math.PI / 2)) % 4,
    Math.round(yaw / (Math.PI / 2)) % 4
  ];
}
function rotateVec(q, v) {
  const [x, y, z] = v,
    qv = [x, y, z, 0];
  return quatMul(quatMul(q, qv), quatConjugate(q)).slice(0, 3);
}

/**
 * Main entry: generates the final item list recursively.
 */
function processScript(
  currentConfig,
  measurements,
  scriptId,
  overrideItems = null
) {
  console.log("🛠 processScript – generálás inputja:", {
    currentConfig,
    measurements,
    scriptId,
    overrideItems,
    defs: store.getState().scriptItems
  });
  const { width, height, depth } = measurements;
  const state = store.getState();
  const work = state.selectedWork || null;
  const defs = state.scriptItems || [];

  function gen(id, cfg, group = "0", lvl = 0) {
    const indent = "  ".repeat(lvl);
    const items = defs.filter((it) => String(it.scriptId) === String(id));
    let out = [];

    items.forEach((item) => {
      const overrideArr = parseSettingString(item.refSettings);
      const overrideObj = overrideArr.reduce((acc, { settingId, value }) => {
        acc[settingId] =
          typeof value === "number" ? value : Number(value) || value;
        return acc;
      }, {});
      const C = { ...overrideObj, ...cfg };
      console.log(`gen level ${lvl}, item ${item.scriptItemId}, merged C=`, C);

      // compute quantity
      const qtyExpr = evaluateFormula(item.qty, C);
      let rawQ;
      try {
        rawQ = new Function(`return (${qtyExpr});`)();
      } catch (e) {
        console.error(`${indent}Error evaluating qty:`, e, qtyExpr);
        rawQ = 0;
      }
      const Q = Math.round(Number(rawQ));
      // ha 0 vagy negatív, semmit sem generálunk erre az item‑re
      if (Q <= 0) {
        return;
      }

      const sizeStr = evaluateFormula(item.size, C);
      // settingsArr kell a helpernek, hogy a (*id*) és width/height/depth cserét meg tudja oldani
      const settingsArr = Object.entries(C).map(([settingId, value]) => ({
        settingId,
        value: String(value)
      }));
      // count=1 → egyszeri [x,y,z]; de ha nested lista vagy ternary, akkor is jó
      const sizes = parseConditionalPosition(
        sizeStr,
        settingsArr,
        [C.width, C.height, C.depth],
        1
      );

      // → POS és ROT expanzió a React-os logika szerint
      const posStr = evaluateFormula(item.position, C);
      const rotStr = evaluateFormula(item.rotation, C);
      /*
      let fallbackPosArr = extractRawList(posStr);
      if (fallbackPosArr.length === 0) fallbackPosArr = [[0, 0, 0]];
      let fallbackRotArr = extractRawList(rotStr);
      if (fallbackRotArr.length === 0) fallbackRotArr = [[0, 0, 0]];*/

      const rawPosList = extractRawList(posStr);
      let fallbackPosArr =
        rawPosList.length > 0
          ? rawPosList.map((str) =>
              evalArr(`[${str}]`, C, [C.width, C.height, C.depth])
            )
          : [[0, 0, 0]];

      const rawRotList = extractRawList(rotStr);
      let fallbackRotArr =
        rawRotList.length > 0
          ? rawRotList.map((str) =>
              evalArr(`[${str}]`, C, [C.width, C.height, C.depth])
            )
          : [[0, 0, 0]];

      const posArr = parseConditionalPosition(
        posStr,
        settingsArr,
        [C.width, C.height, C.depth],
        Q
      );
      const rotArr = parseConditionalPosition(
        rotStr,
        settingsArr,
        [C.width, C.height, C.depth],
        Q
      );
      // ---------------------------------------------------------------------------

      const nid = item.refScriptId || item.refScript;
      if (nid) {
        sizes.forEach((sz, idx) => {
          const [pw, ph, pd] = sz;
          const childCfg = { ...C, width: pw, height: ph, depth: pd };
          const childGroup = `${group}|${idx + 1}`;
          const children = gen(nid, childCfg, childGroup, lvl + 1);
          children.forEach((ci) => {
            // új: összefűzzük a Q darab pozíciót és rotációt egy rekordba
            const basePosList = parseBracketedArrays(ci.position);
            const baseRotList = parseBracketedArrays(ci.rotation);

            // végig a Q darabon, így lesz 20 elem mindig
            // új: Q * ci.qty hosszúságú tömböt csinálunk, dupla ciklussal
            const childCount = ci.qty;
            const posList = [];
            const rotList = [];
            for (let j = 0; j < Q; j++) {
              // a parent forgatás-egység és eltolás
              const P = posArr[j] || posArr[0];
              const pQ = eulerUnitToQuat(rotArr[j] || rotArr[0]);
              for (let k = 0; k < childCount; k++) {
                // 1) pozíció
                const origPos = basePosList[k] || basePosList[0];
                const tp = rotateVec(pQ, origPos);
                const shifted = tp.map((c, i) => c + P[i]);
                posList.push(`[${shifted.join(",")}]`);

                // 2) forgatás
                const pu = rotArr[j] || rotArr[0];
                const cu = baseRotList[j] || baseRotList[0];

                // unit → radian (1 unit = 90° = π/2)
                const [px, py, pz] = pu.map((u) => (u * Math.PI) / 2);
                const [cx, cy, cz] = cu.map((u) => (u * Math.PI) / 2);

                const pQ1 = Quaternion.RotationYawPitchRoll(py, px, pz);
                const cQ = Quaternion.RotationYawPitchRoll(cy, cx, cz);

                // quaternion szorzás a Babylon API-val
                const combo = pQ1.multiply(cQ);

                // ebből Euler szögek radianban
                const e = combo.toEulerAngles();
                const ur = Math.round(e.x / (Math.PI / 2)) % 4;
                const up = Math.round(e.y / (Math.PI / 2)) % 4;
                const uy = Math.round(e.z / (Math.PI / 2)) % 4;

                rotList.push(`[${ur},${up},${uy}]`);
              }
            }
            const allPos = posList.join(",");
            const allRot = rotList.join(",");

            out.push({
              ...ci,
              // ha korábban ci.qty*=Q volt, itt inkább:
              qty: Q * ci.qty || 0,
              position: allPos,
              rotation: allRot,
              groupId: childGroup
            });
          });
        });
      } else {
        // leaf: one entry per size, with full arrays embedded
        sizes.forEach((sz) => {
          const [pw, ph, pd] = sz;
          out.push({
            itemId: null,
            name: item.name,
            material: item.material,
            qty: Q,
            size: `[${pw},${ph},${pd}]`,
            position: posArr.map((a) => `[${a.join(",")}]`).join(","),
            rotation: rotArr.map((a) => `[${a.join(",")}]`).join(","),
            color: null,
            kant: item.kant,
            rotable: item.rotable,
            object: null,
            work: work,
            details: item.details,
            refSettings: item.refSettings,
            refScriptId: nid,
            groupId: group
          });
        });
      }
    });

    return out;
  }

  const res = gen(scriptId, { ...currentConfig, width, height, depth });

  // Ha bármelyik elemnek a material-je "PFL", állítsuk a color-t -1-re
  console.log("processScript input:", {
    currentConfig,
    measurements,
    scriptId,
    overrideItems,
    defs: store.getState().scriptItems
  });
  console.log("processScript output:", res);
  return res;
}

export default processScript;

const evalArr = (raw, overrideSettings, overrideDims) =>
  baseEvalArr(raw, overrideSettings, overrideDims);
