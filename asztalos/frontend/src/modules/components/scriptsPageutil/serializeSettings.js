// src/utils/serializeSettings.js

/**
 * Parses a comma-separated list of "id:val" into
 * [{ settingId, value }, …].
 */
export function parseSettingString(str) {
  if (!str) return [];
  return str
    .split(",")
    .map((pair) => {
      const [id, val] = pair.split(":");
      return id && val ? { settingId: id.trim(), value: val.trim() } : null;
    })
    .filter(Boolean);
}

/**
 * Joins an array of { settingId, value } back to "id:val,id2:val2".
 */
export function serializeSettingArray(arr) {
  return arr.map((s) => `${s.settingId}:${s.value}`).join(",");
}
