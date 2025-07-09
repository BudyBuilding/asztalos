/**
 * Utility functions for TableViewer components.
 * Extracted common procedures such as parsing positions, collision detection, etc.
 */

/**
 * Parses a position string like "[x,y,rot,tableId][...]" into an array of tuples.
 * @param {string} positionString
 * @returns {Array<[number, number, number, number]>}
 */
export function parsePositions(positionString) {
  if (!positionString) return [];
  return positionString
    .replace(/\]\[/g, '],[')
    .split('],[')
    .map(segment => segment.replace(/\[|\]/g, '').split(',').map(Number));
}

/**
 * Generates diagonal lines to fill a rectangular area, used for masking backgrounds.
 * @param {number} widthPx - area width in pixels
 * @param {number} heightPx - area height in pixels
 * @param {number} lineSpacing - spacing between lines in px (default: 10)
 * @param {number} angleDeg - angle of lines in degrees (default: 35)
 * @returns {Array<{ x1: number, y1: number, x2: number, y2: number }>}
 */
export function generateDiagonalLines(widthPx, heightPx, lineSpacing = 10, angleDeg = 35) {
  const angle = (angleDeg * Math.PI) / 180;
  const diagLen = Math.sqrt(widthPx * widthPx + heightPx * heightPx);
  const totalLines = Math.ceil((widthPx + heightPx) / lineSpacing) * 2;
  const lines = [];

  for (let i = -totalLines; i <= totalLines; i++) {
    const offset = i * lineSpacing;
    const x1 = offset * Math.cos(angle) - diagLen * Math.sin(angle);
    const y1 = offset * Math.sin(angle) + diagLen * Math.cos(angle);
    const x2 = offset * Math.cos(angle) + diagLen * Math.sin(angle);
    const y2 = offset * Math.sin(angle) - diagLen * Math.cos(angle);
    lines.push({
      x1: x1 + widthPx / 2,
      y1: y1 + heightPx / 2,
      x2: x2 + widthPx / 2,
      y2: y2 + heightPx / 2,
    });
  }

  return lines;
}

export function makeInstanceIds(itemId, qty) {
  return Array.from({ length: qty }, (_, i) => `${itemId}_${i}`);
}

/**
 * Flattens a list of items to all processed positions for a given table.
 * @param {Array} items - list of processed item objects
 * @param {number|string} tableId
 * @returns {Array<{ instanceId: string, x: number, y: number, width: number, height: number, rotation: number }>} 
 */
export function getTablePositions(items, tableId) {
  return items
    .flatMap(item => (item.processedPositions || []))
    .filter(pos => pos.tableId == tableId);
}

/**
 * Finds the first free (non-overlapping) position in a grid for a w x h rectangle.
 * @param {number} w - width of rectangle
 * @param {number} h - height of rectangle
 * @param {string} currentInstanceId - instance being placed
 * @param {number} tableW - table width
 * @param {number} tableH - table height
 * @param {Array} allPositions - existing positions on table
 * @param {number} step - grid step in px (default: 10)
 * @returns {{ x: number, y: number }|null}
 */
export function findFreePosition(
  w,
  h,
  currentInstanceId,
  tableW,
  tableH,
  allPositions,
  step = 10
) {
  for (let yy = 0; yy <= tableH - h; yy += step) {
    for (let xx = 0; xx <= tableW - w; xx += step) {
      const collision = allPositions.some(p => {
        if (p.instanceId === currentInstanceId) return false;
        return (
          xx < p.x + p.width &&
          xx + w > p.x &&
          yy < p.y + p.height &&
          yy + h > p.y
        );
      });
      if (!collision) return { x: xx, y: yy };
    }
  }
  return null;
}

/**
 * Checks collision with other items and snaps to edges if within a threshold.
 * @param {number} newX
 * @param {number} newY
 * @param {number} w
 * @param {number} h
 * @param {string} currentInstanceId
 * @param {Array} allPoses - positions to check against
 * @param {number} snapThreshold - snapping distance (default: 20)
 * @returns {{ x: number, y: number }} - adjusted coords
 */
export function checkCollisionAndSnap(
  newX,
  newY,
  w,
  h,
  currentInstanceId,
  allPoses,
  snapThreshold = 20
) {
  let adjX = newX;
  let adjY = newY;

  allPoses.forEach(p => {
    if (p.instanceId === currentInstanceId) return;
    if (
      newX < p.x + p.width &&
      newX + w > p.x &&
      newY < p.y + p.height &&
      newY + h > p.y
    ) {
      const dl = Math.abs(newX + w - p.x);
      const dr = Math.abs(newX - (p.x + p.width));
      const dt = Math.abs(newY + h - p.y);
      const db = Math.abs(newY - (p.y + p.height));

      if (dl < snapThreshold && newY + h > p.y && newY < p.y + p.height) adjX = p.x - w;
      else if (dr < snapThreshold && newY + h > p.y && newY < p.y + p.height) adjX = p.x + p.width;
      if (dt < snapThreshold && newX + w > p.x && newX < p.x + p.width) adjY = p.y - h;
      else if (db < snapThreshold && newX + w > p.x && newX < p.x + p.width) adjY = p.y + p.height;
    }
  });

  return { x: adjX, y: adjY };
}

/**
 * Groups tables by their colorId.
 * @param {Array} tables
 * @returns {Record<string, Array>}
 */
export function groupByColor(tables) {
  return tables.reduce((acc, tbl) => {
    const key = tbl.color?.colorId ?? '__NO_COLOR__';
    if (!acc[key]) acc[key] = [];
    acc[key].push(tbl);
    return acc;
  }, {});
}
