/**
 * Evaluates a “[expr,expr,expr]” string (or array) into a numeric [x,y,z] tuple,
 * substituting settings and parent dimensions (width,height,depth).
 * @param raw - The input string (e.g., "[width, height, (*1*)]") or array (e.g., [100, 200, 300])
 * @param settings - Object containing setting IDs and their values (e.g., { "1": 100, "2": 200 })
 * @param parentSize - Array of [width, height, depth] for the parent context
 * @returns [x, y, z] numeric tuple
 */
export function evalArr(raw, settings = {}, parentSize = null) {
  // Determine the current width/height/depth context
  const { width = 0, height = 0, depth = 0 } = parentSize
    ? { width: parentSize[0], height: parentSize[1], depth: parentSize[2] }
    : settings;

  // If raw is an array, cast its elements to numbers and return the first three
  if (Array.isArray(raw)) {
    return raw.slice(0, 3).map(v => Number(v) || 0);
  }

  const str = String(raw || "").trim();
  if (!str.startsWith("[")) {
    return [0, 0, 0];
  }

  // Remove brackets and substitute variables/settings
  let inner = str.slice(1, -1)
    .replace(/\bwidth\b/g, width)
    .replace(/\bheight\b/g, height)
    .replace(/\bdepth\b/g, depth)
    .replace(/\(\*(\d+)\*\)/g, (_, id) =>
      String(settings[id] != null ? settings[id] : 0)
    );

  // Split on commas and evaluate each expression
  const parts = inner.split(",").map(seg => {
    try {
      // Use new Function to safely evaluate arithmetic expressions
      return Number(new Function(`return (${seg})`)());
    } catch {
      return 0;
    }
  });

  return [
    parts[0] || 0,
    parts[1] || 0,
    parts[2] || 0
  ];
}