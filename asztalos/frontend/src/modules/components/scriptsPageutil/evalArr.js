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
  const parts = [];
  let depthPar = 0,
    last = 0;
  for (let i = 0; i < inner.length; i++) {
    if (inner[i] === "(") depthPar++;
    else if (inner[i] === ")") depthPar--;
    else if (inner[i] === "," && depthPar === 0) {
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
        return s ? s.value : "0";
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

/**
 * Expands “i(start,end)” macros into count-length arrays along each axis,
 * or repeats constants.
 */
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
    hasMacro && !/\bi\(/.test(p) ? `i(${p.trim()},${p.trim()})` : p
  );

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
  });

  return Array.from({ length: count }, (_, i) => [
    axes[0][i],
    axes[1][i],
    axes[2][i]
  ]);
}

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
}
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
  console.log("  → evaluating:", inner);
  const result = new Function(`return (${inner});`)();
  // ha tömbök tömbjét kaptuk, akkor az a több pozíció, egyébként csomagoljuk
  return Array.isArray(result[0]) ? result : [result];
}
