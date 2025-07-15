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
    // no bracket, or contains macro -> placeholder
    if (/\bi\(\s*[+-]?\d+,\s*[+-]?\d+\s*\)/.test(str)) return [0, 0, 0];
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

export function expandIterated(rawParts, count, parentSettings, parentSize) {
  // 1) Mindig 3 tengelyünk legyen
  const parts = rawParts.slice();
  while (parts.length < 3) parts.push("0");

  // 2) Tagolás
  const norm = parts.map((p) => p.trim());

  // 3) Settings + dims egy objektumba
  const S = Object.fromEntries(
    parentSettings.map(({ settingId, value }) => {
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
      const [startExpr, endExpr] = splitIMacroArgs(part);
      // tisztítsuk meg (makrócsere, változóhelyettesítés)
      const cleanStart = evaluateFormula(startExpr, S);
      const cleanEnd = evaluateFormula(endExpr, S);
      // JS‐eval
      const start = Number(new Function(`return (${cleanStart})`)());
      const end = Number(new Function(`return (${cleanEnd})`)());
      if (count === 1) return [start];
      const step = (end - start) / (count - 1);
      return Array.from({ length: count }, (_, i) => start + step * i);
    }
    // ha nem i(...), akkor evalArr‐rel egyszer lekérjük, és ismételjük
    const v = evalArr(`[${part}]`, parentSettings, parentSize)[0] || 0;
    return Array(count).fill(v);
  });

  // 5) Összeállítjuk a [x,y,z] mátrixot
  return Array.from({ length: count }, (_, i) => [
    axes[0][i],
    axes[1][i],
    axes[2][i]
  ]);
}

/**
 * Expands “i(start,end)” macros into count-length arrays along each axis,
 * or repeats constants.
 */ /*
export function expandIterated(
  rawParts,
  count,
  parentSettings,
  parentSize,
  settingsList,
  userDimensions
) {
  // ensure length 3
  const parts = rawParts.slice();
  while (parts.length < 3) parts.push("0");
  const hasMacro = parts.some((p) =>
    /\bi\(\s*[+-]?\d+,\s*[+-]?\d+\s*\)/.test(p)
  );
  // normalize: wrap constants in i(...)
  const norm = parts.map((p) =>
    /\bi\(/.test(p) && !/^i\(/.test(p) ? `i(${p},${p})` : p
  );

  const macroRe = /^i\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)$/;
  const axes = norm.map((part) => {
    const m = part.match(macroRe);
    if (m) {
      const startExpr = m[1].trim();
      const endExpr = m[2].trim();
      // kiértékeljük kifejezéseket:
      const start = evalArr(`[${startExpr}]`, parentSettings, parentSize)[0];
      const end = evalArr(`[${endExpr}]`, parentSettings, parentSize)[0];
      if (count === 1) return [start];
      const step = (end - start) / (count - 1);
      return Array.from({ length: count }, (_, i) => start + step * i);
    }
    // konstans → egyszer kiértékeljük, aztán ismételjük
    const v = evalArr(`[${part}]`, parentSettings, parentSize)[0] || 0;
    return Array(count).fill(v);
  });

  return Array.from({ length: count }, (_, i) => [
    axes[0][i],
    axes[1][i],
    axes[2][i]
  ]);
*/
/*

  const axes = norm.map((part) => {
    const m = part.match(/^i\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*\)$/);
    if (m) {
      const [_, s, e] = m.map(Number);
      if (count === 1) return [s];
      const step = (e - s) / (count - 1);
      return Array.from({ length: count }, (_, i) => s + step * i);
    }
    // constant → eval once, repeat
    const v =
      evalArr(
        `[${part}]`,
        parentSettings,
        parentSize,
        settingsList,
        userDimensions
      )[0] || 0;
    return Array(count).fill(v);
  });*/
/*
  return Array.from({ length: count }, (_, i) => [
    axes[0][i],
    axes[1][i],
    axes[2][i]
  ]);
}*/

/**
 * Extract raw “[x,y,z]” substrings from a string for later parsing.
 */
export function extractRawList(str) {
  if (!str) return [];
  const s = String(str).trim();
  // ha van ?: akkor az egész kifejezés egy elem legyen
  if (s.includes("?")) {
    return [s];
  }
  const matches = s.match(/\[[^\]]+\]/g);
  return matches ? matches.map((m) => m.slice(1, -1).trim()) : [s];
}

// (You can similarly lift splitTopLevel, parseBracketExprList, evaluateFormula…)
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
} /*
export function parseConditionalPosition(expr, settingsObj, parentSize) {
  // először is settingsObj-ot már jó formában kapjuk (felül javítottuk fent).
  // cseréljük tovább a width/height/depth változókat is…
  let inner = expr
    .slice(1, -1)
    .replace(/\(\*(\d+)\*\)/g, (_, id) => JSON.stringify(settingsObj[id] ?? 0));
  const [w, h, d] = parentSize;
  inner = inner
    .replace(/\bwidth\b/g, w)
    .replace(/\bheight\b/g, h)
    .replace(/\bdepth\b/g, d);

  // és most már biztonságosan kiértékeljük
  const result = new Function(`return (${inner});`)();
  // ha tömbök tömbjét kaptuk, akkor az a több pozíció, egyébként csomagoljuk
  return Array.isArray(result[0]) ? result : [result];
}*/
export function parseConditionalPosition(
  raw,
  parentSettings,
  parentSize,
  count = 1
) {
  // 1) felépítjük a setting→number map‑et a feltételhez:
  const S = Object.fromEntries(
    parentSettings.map(({ settingId, value }) => {
      const asNum = Number(value);
      // if it really is a number, store it as Number; otherwise keep the raw string
      return [
        settingId,
        String(value).trim() === String(asNum) ? asNum : value
      ];
    })
  );
  const [w, h, d] = parentSize;
  S.width = w;
  S.height = h;
  S.depth = d;

  // 2) kicsípjük a "cond ? trueBranch : falseBranch" részt
  let inner = raw.trim().replace(/^\[|\]$/g, "");
  let depth = 0,
    q = -1,
    c = -1;
  for (let i = 0; i < inner.length; i++) {
    if (inner[i] === "(") depth++;
    else if (inner[i] === ")") depth--;
    else if (inner[i] === "?" && depth === 0) q = i;
    else if (inner[i] === ":" && depth === 0) {
      c = i;
      break;
    }
  }
  if (q < 0 || c < 0) return Array(count).fill([0, 0, 0]); // fallback

  const condExpr = inner.slice(0, q).trim();
  const trueBranch = inner.slice(q + 1, c).trim();
  const falseBranch = inner.slice(c + 1).trim();

  // 3) kiértékeljük a feltételt
  const cleanedCond = evaluateFormula(condExpr, S);
  const condValue = new Function(`return (${cleanedCond})`)();

  // 4) kiválasztjuk az ágat
  const branch = condValue ? trueBranch : falseBranch;

  // 5) bontsuk fel top‑level vessző mentén
  let list = branch.trim();
  if (list.startsWith("[") && list.endsWith("]")) {
    list = list.slice(1, -1);
  }
  const parts = [];
  depth = 0;
  let last = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] === "(") depth++;
    else if (list[i] === ")") depth--;
    else if (list[i] === "," && depth === 0) {
      parts.push(list.slice(last, i).trim());
      last = i + 1;
    }
  }
  parts.push(list.slice(last).trim());

  // 6) és végül az expandIterated megcsinálja nekünk a [x,y,z] tömböket:
  return expandIterated(parts, count, parentSettings, parentSize);
}
