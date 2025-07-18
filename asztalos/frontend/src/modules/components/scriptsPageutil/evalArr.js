// src/utils/evalArr.js
import { Vector3, Quaternion, Matrix } from "@babylonjs/core";

/**
 * Evaluate a “[x,y,z]”-style expression, substituting width/height/depth
 * and (*id*) macros. Returns [x,y,z].
 */
export function evalArr(
  raw,
  overrideSettings = null,
  overrideDims = null,
  settingsList = [],
  userDimensions = {}
) {
  const asStr = String(raw || "").trim();
  // if it looks like an i‑macro in the 3rd slot, split on top‑level commas instead of `String.split`
  if (asStr.startsWith("[") && asStr.endsWith("]") && /\b,i\(/.test(asStr)) {
    const inner = asStr.slice(1, -1);
    // this will give you exactly three pieces, even if the 3rd contains commas
    const parts = splitTopLevel(inner);
    const coords = expandIterated(
      parts,
      1,
      overrideSettings || settingsList,
      overrideDims || [
        userDimensions.width,
        userDimensions.height,
        userDimensions.depth
      ]
    );
    return coords[0] || [0, 0, 0];
  }
  const settingsToUse = overrideSettings || settingsList;
  const {
    width = 0,
    height = 0,
    depth = 0
  } = overrideDims
    ? {
        width: overrideDims[0],
        height: overrideDims[1],
        depth: overrideDims[2]
      }
    : userDimensions;

  if (Array.isArray(raw)) {
    return raw.slice(0, 3).map((v) => Number(v) || 0);
  }
  const str = String(raw || "").trim();
  if (!str.startsWith("[") || !str.endsWith("]")) {
    return [0, 0, 0];
  }
  // strip [ … ]
  const inner = str.slice(1, -1);
  // split top-level by commas
  // split top-level by commas, tracking both () and []
  const parts = [];
  let depthPar = 0,
    depthBr = 0,
    last = 0;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === "(") depthPar++;
    else if (ch === ")") depthPar--;
    else if (ch === "[") depthBr++;
    else if (ch === "]") depthBr--;
    else if (ch === "," && depthPar === 0 && depthBr === 0) {
      parts.push(inner.slice(last, i).trim());
      last = i + 1;
    }
  }
  parts.push(inner.slice(last).trim());

  return parts.slice(0, 3).map((expr0) => {
    let expr = expr0.replace(/^[\[\]]+|[\[\]]+$/g, "").trim();
    if (!expr) return 0;
    // substitute macros
    expr = expr
      .replace(/\bwidth\b/g, width)
      .replace(/\bheight\b/g, height)
      .replace(/\bdepth\b/g, depth)
      .replace(/\(\*(\d+)\*\)/g, (_, id) => {
        const s = settingsToUse.find((x) => String(x.settingId) === id);
        if (!s) return "0";
        // if it’s numeric, emit the number; if not, quote it
        return typeof s.value === "number" ? s.value : JSON.stringify(s.value);
      });
    try {
      // eslint-disable no-new-func
      const val = new Function(`return (${expr})`)();
      return Number(val) || 0;
    } catch {
      return 0;
    }
  });
}
/*
function splitIMacroArgs(str) {
  // str === "i(...)" bemenet
  const inner = str.slice(2, -1);
  let depth = 0;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) {
      return [
        inner.slice(0, i).trim(), // startExpr
        inner.slice(i + 1).trim() // endExpr
      ];
    }
  }
  // ha nem találunk vesszőt, visszaadunk mindkettőt ugyanúgy
  return [inner, inner];
}
*/

function splitIMacroArgs(str) {
  const inner = str.slice(2, -1);
  const parts = splitTopLevel(inner).map((s) => s.trim());
  return parts;
}

export function expandIterated(rawParts, count, parentSettings, parentSize) {
  let settingsArr;
  if (Array.isArray(parentSettings)) {
    settingsArr = parentSettings;
  } else if (parentSettings && typeof parentSettings === "object") {
    settingsArr = Object.entries(parentSettings)
      .filter(([k]) => !["width", "height", "depth"].includes(k))
      .map(([settingId, value]) => ({ settingId, value }));
  } else {
    settingsArr = [];
  }
  // 0) Minden részről szabadítsd meg a külső [ ] jeleket
  const cleaned = rawParts.map((p) => p.replace(/^\[|\]$/g, "").trim());
  if (
    cleaned.length === 1 &&
    cleaned[0].includes(",") &&
    // nincsen benne i(...) makró és nincsen ?: conditional
    !/\bi\(/.test(cleaned[0]) &&
    !cleaned[0].includes("?")
  ) {
    // használd a splitTopLevel-t, hogy jól kezelje akár belső zárójelezést is
    const partsFromOne = splitTopLevel(cleaned[0]);
    // csak az első három tengelyt tartsd meg
    cleaned.splice(0, 1, ...partsFromOne.slice(0, 3));
  }
  // 1) Most már a cleaned-et használd tovább (helyettesítsd a parts-et ezzel)
  const parts = cleaned.slice();
  while (parts.length < 3) parts.push("0");

  // DEBUG, ha kell:
  console.log(
    "[EI] parts(cleaned):",
    parts,
    "count:",
    count,
    "parentSize:",
    parentSize
  );

  // 2) A normál feldolgozás változatlan:
  const norm = parts.map((p) => p.trim());

  // 3) Settings + dims egy objektumba
  console.log("parentsettings: ", parentSettings);
  const S = Object.fromEntries(
    settingsArr.map(({ settingId, value }) => {
      // if it parses as a plain number, store Number; otherwise keep the raw string
      const asNum = Number(value);
      return [
        settingId,
        String(value).trim() === String(asNum) ? asNum : value
      ];
    })
  );
  S.width = parentSize[0];
  S.height = parentSize[1];
  S.depth = parentSize[2];

  // 4) Megnézzük tengelyenként, hogy i(...)‐e, vagy konstans
  const axes = norm.map((part) => {
    if (part.startsWith("i(") && part.endsWith(")")) {
      // bontsuk fel start‐re és end‐re
      const [startExpr, endExpr, mode] = splitIMacroArgs(part);
      // tisztítsuk meg (makrócsere, változóhelyettesítés)
      const cleanStart = evaluateFormula(startExpr, S);
      const cleanEnd = evaluateFormula(endExpr, S);
      // JS‐eval
      const start = Number(new Function(`return (${cleanStart})`)());
      const end = Number(new Function(`return (${cleanEnd})`)());

      if (mode === "c") {
        if (count === 1) {
          return [(start + end) / 2];
        }
        const step = (end - start) / (count + 1);
        return Array.from({ length: count }, (_, i) => start + step * (i + 1));
      }

      if (count === 1) return [start];
      const step = (end - start) / (count - 1);
      return Array.from({ length: count }, (_, i) => start + step * i);
    }
    // ha nem i(...), akkor evalArr‐rel egyszer lekérjük, és ismételjük
    const v = evalArr(`[${part}]`, settingsArr, parentSize)[0] || 0;
    return Array(count).fill(v);
  });

  // 5) Összeállítjuk a [x,y,z] mátrixot
  return Array.from({ length: count }, (_, i) => [
    axes[0][i],
    axes[1][i],
    axes[2][i]
  ]);
}

function splitTopLevel(str) {
  const parts = [];
  let depthPar = 0,
    depthBr = 0,
    last = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "(") depthPar++;
    else if (ch === ")") depthPar--;
    else if (ch === "[") depthBr++;
    else if (ch === "]") depthBr--;
    else if (ch === "," && depthPar === 0 && depthBr === 0) {
      parts.push(str.slice(last, i).trim());
      last = i + 1;
    }
  }
  parts.push(str.slice(last).trim());
  return parts;
}

export function extractRawList(str) {
  if (!str) return [];
  const s = String(str).trim();

  // ha tényleg nested lista a formátum (két vagy több "[…]" egymás után)
  if (s.startsWith("[[") && s.endsWith("]]")) {
    // vágjuk le az első/utolsó szögletes zárójelet
    const inner = s.slice(1, -1);
    // szedjük szét top‑levelben
    const raws = splitTopLevel(inner);
    // és szabadítsuk meg az egyes részeket a külső [ ]
    return raws.map((r) => r.replace(/^\[|\]$/g, ""));
  }

  // ha van ?, passzoljuk tovább egyben
  if (s.includes("?")) return [s];

  // egyébként csak a "[…]" blokkokat gyűjtsük ki
  const matches = s.match(/\[[^\]]*\]/g) || [];
  return matches.length > 0 ? matches : [s];
}

export function evaluateFormula(formula, settingsObj) {
  // 1) stringgé alakítjuk és trimeljük
  let expr = String(formula).trim();

  // 2) levágjuk az esetleges végződő + - * / vagy szóközöket
  expr = expr.replace(/[+\-*/\s]+$/, "");

  // 3) (*id*) makrók cseréje
  expr = expr.replace(/\(\*(\d+)\*\)/g, (_, id) => {
    const v = settingsObj[id];
    return typeof v === "number" ? v : `"${v}"`;
  });

  // 4) width/height/depth változók cseréje
  expr = expr.replace(/\b(width|height|depth)\b/g, (_, v) =>
    String(settingsObj[v] != null ? settingsObj[v] : 0)
  );

  return expr;
}

export function parseConditionalPosition(
  raw,
  parentSettings,
  parentSize,
  count = 1
) {
  count = parseInt(count, 10);
  if (isNaN(count) || count < 1) count = 1;
  // ——————————————————————————————————————
  console.log("[PCP] raw:", raw, "parentSize:", parentSize);

  // 1) Mátrix-vágás
  const raws = extractRawList(raw);
  console.log("[PCP] raws after extractRawList:", raws);

  // 2) Egyszerű többsoros lista?
  if (!raw.includes("?") && raws.length > 1) {
    const coords = raws.map((str) =>
      evalArr(`[${str}]`, parentSettings, parentSize)
    );
    console.log("[PCP] nested coords:", coords);
    return coords;
  }

  // 3) Csak egy elem, nincs ?: → expandIterated
  if (!raw.includes("?")) {
    // vágjuk le a külső [ ]
    const inner = raw.replace(/^\[|\]$/g, "");
    // osszuk a három tengelyre top-level vesszőknél
    const parts = splitTopLevel(inner)
      .map((s) => s.trim())
      .slice(0, 3);
    console.log("[PCP] simple expandIterated parts:", parts);
    return expandIterated(parts, count, parentSettings, parentSize);
  }

  // 4) Van ?: → bontás
  const inner = raw.replace(/^\[|\]$/g, "");
  let depth = 0,
    qPos = -1,
    cPos = -1;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "?" && depth === 0) qPos = i;
    else if (ch === ":" && depth === 0 && qPos >= 0) {
      cPos = i;
      break;
    }
  }
  if (qPos < 0 || cPos < 0) {
    console.warn("[PCP] malformed conditional, falling back");
    return expandIterated(raws, count, parentSettings, parentSize);
  }

  const condExpr = inner.slice(0, qPos).trim();
  const trueBranch = inner.slice(qPos + 1, cPos).trim();
  const falseBranch = inner.slice(cPos + 1).trim();
  console.log("[PCP] condExpr:", condExpr);

  // 5) Makró- és dimenzió-helyettesítés
  const S = Object.fromEntries(
    parentSettings.map(({ settingId, value }) => {
      const num = Number(value);
      return [settingId, String(num) === String(value) ? num : value];
    })
  );
  S.width = parentSize[0];
  S.height = parentSize[1];
  S.depth = parentSize[2];

  const expr = evaluateFormula(condExpr, S);
  console.log("[PCP] evaluated cond expr:", expr);
  const condVal = new Function(`return (${expr})`)();

  // 7) Végül ezeket átadjuk az expandIterated‑nek
  const branchRaw = condVal ? trueBranch : falseBranch;
  // ha nested lista (két vagy több "[…]" egymás után), akkor egyszerű lista‑eval
  if (branchRaw.trim().startsWith("[[") && branchRaw.trim().endsWith("]]")) {
    // extractRawList visszaadja az egyes "[…]" blokkokat belül
    const raws = extractRawList(branchRaw);
    console.log("[PCP] nested conditional coords:", raws);
    // minden sorra hívd az evalArr-t
    return raws.map((str) => evalArr(`[${str}]`, parentSettings, parentSize));
  }
  // egyébként mint eddig: split → expandIterated
  const chosen1 = branchRaw.replace(/^\[|\]$/g, "");
  const parts1 = splitTopLevel(chosen1)
    .map((p) => p.trim())
    .slice(0, 3);
  console.log("[PCP] conditional parts1:", parts1);
  return expandIterated(parts1, count, parentSettings, parentSize);
}
