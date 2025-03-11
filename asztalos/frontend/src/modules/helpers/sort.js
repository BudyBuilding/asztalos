// sort.js
const sorting = (items, config) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Invalid input: items must be a non-empty array.");
  }

  if (!config || typeof config !== "object" || !config.key || !config.direction) {
    throw new Error("Invalid config: key and direction must be provided.");
  }

  const { key, direction, inProgressPriority = false } = config;
  const sortableItems = [...items];

  sortableItems.sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    // Ha nincs egyik érték se
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === 1 ? 1 : -1;
    if (bValue == null) return direction === 1 ? -1 : 1;

    // Speciális logika: "In Progress" előre sorolása (opcionális)
    const aStatus = inProgressPriority && aValue === "In Progress" ? "" : aValue;
    const bStatus = inProgressPriority && bValue === "In Progress" ? "" : bValue;

    // String típusok
    if (typeof aStatus === "string" && typeof bStatus === "string") {
      return direction === 1 
        ? aStatus.localeCompare(bStatus, undefined, { sensitivity: "base" }) 
        : bStatus.localeCompare(aStatus, undefined, { sensitivity: "base" });
    }

    // Szám típusok
    if (typeof aStatus === "number" && typeof bStatus === "number") {
      return direction === 1 ? aStatus - bStatus : bStatus - aStatus;
    }

    // Dátum típusok
    if (aStatus instanceof Date && bStatus instanceof Date) {
      return direction === 1 ? aStatus - bStatus : bStatus - aStatus;
    }

    // Fallback egyéb típusokra
    return 0;
  });

  return sortableItems;
};

export default sorting;
