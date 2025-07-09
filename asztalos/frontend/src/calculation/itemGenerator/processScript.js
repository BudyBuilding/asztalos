  import store from "../../data/store/store";
import {
  Quaternion, 
} from "@babylonjs/core";
  function evaluateFormula(formula, settings) {
    const settingRegex = /\(\*(\d+)\*\)/g;
    let result = formula.replace(settingRegex, (_, p1) =>
      String(settings[p1] != null ? settings[p1] : 0)
    );
    result = result.replace(/\b(width|height|depth)\b/g, (_, varName) =>
      String(settings[varName] != null ? settings[varName] : 0)
    );
    return result;
  }


  function parseBracketedArrays(str) {
    const arrays = [];
    const arrayRegex = /\[([^\]]+)\]/g;
    let match;
    while ((match = arrayRegex.exec(str)) !== null) {
      arrays.push(
        match[1]
          .split(",")
          .map(seg => Number(eval(seg.trim())))
      );
    }
    return arrays;
  }

  function splitTopLevel(str) {
    const parts = [];
    let depth = 0, last = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '(') depth++;
      else if (str[i] === ')') depth--;
      else if (str[i] === ',' && depth === 0) {
        parts.push(str.slice(last, i).trim());
        last = i + 1;
      }
    }
    parts.push(str.slice(last).trim());
    return parts;
  }
/*
  function expandIterated(rawStr, count, parentSettings, parentSize) {
    const parts = splitTopLevel(rawStr);
    while (parts.length < 3) parts.push("0");

    const hasMacro = parts.some(p => /\bi\(\s*[+-]?\d+\s*,\s*[+-]?\d+\s*\)/.test(p));
    const norm = parts.map(p =>
      hasMacro && !/\bi\(/.test(p)
        ? `i(${p},${p})`
        : p
    );

    const axes = norm.map(p => {
      const m = p.match(/^i\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*\)$/);
      if (m) {
        const start = +m[1], end = +m[2];
        if (count === 1) return [start];
        const step = (end - start) / (count - 1);
        return Array.from({ length: count }, (_, i) => start + step * i);
      }
      // konstans tengely
      const val = evalArr(`[${p}]`, parentSettings, parentSize)[0] || 0;
      return Array(count).fill(val);
    });

    // 5) összeállítjuk a [x,y,z]-t minden egyes i-edik példányra
    const res = Array.from({ length: count }, (_, i) => [
      axes[0][i],
      axes[1][i],
      axes[2][i]
    ]);

    return res;
  }*/

 function expandIterated(rawStr, count, parentSettings, parentSize) {
   // 1) felbontjuk top-levelben a három tengelyre
   const parts = splitTopLevel(rawStr);
   while (parts.length < 3) parts.push("0");

   // 2) ha bármelyik tengely makró, konstansokat is i(val,val)-re alakítjuk
   const hasMacro = parts.some(p => /\bi\(\s*[+-]?\d+\s*,\s*[+-]?\d+\s*\)/.test(p));
   const norm = parts.map(p =>
     hasMacro && !/\bi\(/.test(p)
       ? `i(${p.trim()},${p.trim()})`
       : p
   );

   // 3) tengelyenként generáljuk a sorozatot
   const axes = norm.map(p => {
     const m = p.match(/^i\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*\)$/);
     if (m) {
       const start = +m[1], end = +m[2];
       if (count === 1) return [start];
       const step = (end - start) / (count - 1);
       return Array.from({ length: count }, (_, i) => start + step * i);
     }
     // konstans tengely
     const v = evalArr(`[${p}]`, parentSettings, parentSize)[0] || 0;
     return Array(count).fill(v);
   });

   // 4) összerakjuk a [x,y,z] tömböket
  return Array.from({ length: count }, (_, i) => [
    axes[0][i],
    axes[1][i],
     axes[2][i]
   ]);
 }

  function parseSettingString(str) {
    return str
      ? str.split(",").map(pair => {
          const [id, val] = pair.split(":");
          return id && val
            ? { settingId: id, default_value: Number(val) }
            : null;
        }).filter(Boolean)
      : [];
  }

  // Quaternion & vector helpers for unit rotations (0=0°,1=90°)
  function quatMul(a, b) {
    const [ax, ay, az, aw] = a;
    const [bx, by, bz, bw] = b;
    return [
      aw*bx + ax*bw + ay*bz - az*by,
      aw*by - ax*bz + ay*bw + az*bx,
      aw*bz + ax*by - ay*bx + az*bw,
      aw*bw - ax*bx - ay*by - az*bz
    ];
  }

  function quatConjugate([x, y, z, w]) {
    return [-x, -y, -z, w];
  }

  function eulerUnitToQuat([ux, uy, uz]) {
  const pitch = ux * (Math.PI/2);
  const yaw   = uy * (Math.PI/2);
  const roll  = uz * (Math.PI/2);

  const cy = Math.cos(yaw/2),   sy = Math.sin(yaw/2);
  const cp = Math.cos(pitch/2), sp = Math.sin(pitch/2);
  const cr = Math.cos(roll/2),  sr = Math.sin(roll/2);

  const qYaw   = [ 0, sy,  0, cy];
  const qPitch = [sp, 0,   0, cp];
  const qRoll  = [ 0,  0,  sr, cr];

  return quatMul(quatMul(qYaw, qPitch), qRoll);
  }

  function quatToEulerUnit([x, y, z, w]) {
    const sinr = 2*(w*x + y*z);
    const cosr = 1 - 2*(x*x + y*y);
    let roll = Math.atan2(sinr, cosr);

    let sinp = 2*(w*y - z*x);
    sinp = Math.min(1, Math.max(-1, sinp));
    let pitch = Math.asin(sinp);

    const siny = 2*(w*z + x*y);
    const cosy = 1 - 2*(y*y + z*z);
    let yaw = Math.atan2(siny, cosy);

    return [
      Math.round(roll  / (Math.PI/2)),
      Math.round(pitch / (Math.PI/2)),
      Math.round(yaw   / (Math.PI/2))
    ];
  }

  function rotateVec(q, v) {
    const qv    = [v[0], v[1], v[2], 0];
    const qConj = quatConjugate(q);
    const tmp   = quatMul(q, qv);
    const res   = quatMul(tmp, qConj);
    return [res[0], res[1], res[2]];
  }
function expandIteratedRotation(rawParts, count, parentSettings, parentSize) {
  const units = expandIterated(rawParts, count, parentSettings, parentSize);
  return units.map(u => eulerUnitToQuat(u));  // [ [qx,qy,qz,qw], … ]
}

  /**
   * Main entry: generates the final item list recursively.
   */
  function processScript(currentConfig, measurements, scriptId, overrideItems = null) {
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
      const items = defs.filter(it => String(it.scriptId) === String(id));
      let out = [];

      items.forEach(item => {
        const C = { ...cfg };
        parseSettingString(item.refSettings).forEach(({ settingId, default_value }) => {
        C[settingId] = default_value;
      });

        // compute quantity
        const qtyEval = evalArr(`[${Number(item.qty)}]`, C, [C.width,C.height,C.depth]);
        const Q = Math.max(1, Math.round(qtyEval[0]));

        // prepare size list
        const sizes = parseBracketedArrays(evaluateFormula(item.size, C));

      // → POS és ROT expanzió a React-os logika szerint
        const posStr = evaluateFormula(item.position, C);
        const rotStr = evaluateFormula(item.rotation, C);

          let fallbackPosArr = parseBracketedArrays(posStr);
          if (fallbackPosArr.length === 0) fallbackPosArr = [[0,0,0]];
          let fallbackRotArr = parseBracketedArrays(rotStr);
          if (fallbackRotArr.length === 0) fallbackRotArr = [[0,0,0]];

          // 2) ténylegesen bővítjük a Q hosszúságra
          const hasMacro = /\bi\(/.test(posStr) || /\bi\(/.test(rotStr);
          const posArr = hasMacro
            ? expandIterated(posStr.replace(/^\[|\]$/g, ""), Q, C, [C.width, C.height, C.depth])
            : Array.from({ length: Q }, (_, i) =>
                fallbackPosArr[i] || fallbackPosArr[0]
              );

          const rotArr = hasMacro
            ? expandIterated(rotStr.replace(/^\[|\]$/g, ""), Q, C, [C.width, C.height, C.depth])
            : Array.from({ length: Q }, (_, i) =>
                fallbackRotArr[i] || fallbackRotArr[0]
              );
  // ---------------------------------------------------------------------------
          
        const nid = item.refScriptId || item.refScript;
        if (nid) {
    sizes.forEach((sz, idx) => {
      const [pw,ph,pd] = sz;
      const childCfg   = { ...C, width: pw, height: ph, depth: pd };
      const childGroup = `${group}|${idx+1}`;
      const children   = gen(nid, childCfg, childGroup, lvl+1);
      children.forEach(ci => {
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
          const P   = posArr[j] || posArr[0];
          const pQ  = eulerUnitToQuat(rotArr[j] || rotArr[0]);
          for (let k = 0; k < childCount; k++) {
            // 1) pozíció
            const origPos = basePosList[k] || basePosList[0];
            const tp      = rotateVec(pQ, origPos);
            const shifted = tp.map((c,i) => c + P[i]);
            posList.push(`[${shifted.join(",")}]`);

            // 2) forgatás
            const pu = rotArr[j]  || rotArr[0];
            const cu = baseRotList[j] || baseRotList[0];
          
            // unit → radian (1 unit = 90° = π/2)
            const [px, py, pz] = pu.map(u => u * Math.PI/2);
            const [cx, cy, cz] = cu.map(u => u * Math.PI/2);

            const pQ1 = Quaternion.RotationYawPitchRoll(py, px, pz);
            const cQ = Quaternion.RotationYawPitchRoll(cy, cx, cz);
        
            // quaternion szorzás a Babylon API-val
            const combo = pQ1.multiply(cQ);
          
            // ebből Euler szögek radianban
            const e = combo.toEulerAngles();
            const ur = Math.round(e.x / (Math.PI/2)) % 4;
            const up = Math.round(e.y / (Math.PI/2)) % 4;
            const uy = Math.round(e.z / (Math.PI/2)) % 4;

            rotList.push(`[${ur},${up},${uy}]`);
          }
        }
        const allPos = posList.join(",");
const allRot = rotList.join(",");
/*
     const allRot = Array.from({ length: Q }, (_, j) => {
       // a parent és child unit-egységekből quaternion-t készítünk
       const pu = rotArr[j]  || rotArr[0];
       const cu = baseRotList[j] || baseRotList[0];
    
       // unit → radian (1 unit = 90° = π/2)
       const [px, py, pz] = pu.map(u => u * Math.PI/2);
       const [cx, cy, cz] = cu.map(u => u * Math.PI/2);
    
       // BabylonJS-Quaternion létrehozása yaw,pitch,roll sorrendben
       const pQ = Quaternion.RotationYawPitchRoll(py, px, pz);
       const cQ = Quaternion.RotationYawPitchRoll(cy, cx, cz);
    
       // quaternion szorzás a Babylon API-val
       const combo = pQ.multiply(cQ);
    
       // ebből Euler szögek radianban
       const e = combo.toEulerAngles();
    
       // visszakonvertálás unit-egységekre: radian ÷ (π/2), majd kerekítés
       const ur = Math.round(e.x / (Math.PI/2)) % 4;
       const up = Math.round(e.y / (Math.PI/2)) % 4;
       const uy = Math.round(e.z / (Math.PI/2)) % 4;
    
       return `[${ur},${up},${uy}]`;
     }).join(",");*/
        

      out.push({
        ...ci,
        // ha korábban ci.qty*=Q volt, itt inkább:
        qty: Q * ci.qty || 0,
        position: allPos,
        rotation: allRot,
        groupId: childGroup,
        });
      });
    });
        } else {
          // leaf: one entry per size, with full arrays embedded
          sizes.forEach(sz=>{
            const [pw,ph,pd] = sz;
            out.push({
              itemId:      null,
              name:        item.name,
              material:    item.material,
              qty:         Q,
              size:        `[${pw},${ph},${pd}]`,
              position:    posArr.map(a => `[${a.join(",")}]`).join(","),
              rotation:    rotArr.map(a => `[${a.join(",")}]`).join(","),
              color:       null,
              kant:        item.kant,
              rotable:     item.rotable,
              object:      null,
              work:        work,
              details:     item.details,
              refSettings: item.refSettings,
              refScriptId: nid,
              groupId:     group
            });
          });
        }
      });

      return out;

    }

    const res =gen(scriptId, { ...currentConfig, width, height, depth });
      console.log("✅ processScript – generált elemek:", res);
    return res;
    }

  export default processScript;


  function evalArr(raw, settings = {}, parentSize = null) {
    // 1) alap dimenziók
    const { width: w0 = 0, height: h0 = 0, depth: d0 = 0 } = parentSize
      ? { width: parentSize[0], height: parentSize[1], depth: parentSize[2] }
      : settings;

    // ha már tömb, marad a sima konverzió
    if (Array.isArray(raw)) {
      return raw.slice(0, 3).map(v => Number(v) || 0);
    }
    const str = String(raw || "").trim();
    if (!str.startsWith("[")) return [0,0,0];

    // 2) változók és (*id*) makrók behelyettesítése
    const jsExpr = str
      .replace(/\bwidth\b/g,  w0)
      .replace(/\bheight\b/g, h0)
      .replace(/\bdepth\b/g,  d0)
      .replace(/\(\*(\d+)\*\)/g, (_, id) =>
        String(settings[id] != null ? settings[id] : 0)
      );

    // 3) teljes JS-eval: támogatja a ? : operátort, logikai kifejezéseket, stb.
    try {
      const result = new Function(`return ${jsExpr}`)();
      if (Array.isArray(result)) {
        return result.slice(0, 3).map(v => Number(v) || 0);
      }
    } catch (err) {
      console.error("evalArr hiba:", err);
    }
    return [0,0,0];
  }
