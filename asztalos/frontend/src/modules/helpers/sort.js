// sort.js
// this function sorts a list by a config

const sorting = (items, config) => {
  // Error handling for missing or invalid input
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Invalid input: items must be a non-empty array.");
  }

  if (
    !config ||
    typeof config !== "object" ||
    !config.key ||
    !config.direction
  ) {
    throw new Error("Invalid config: key and direction must be provided.");
  }

  const { key, direction } = config;

  const sortableItems = [...items];

  // we have to get all the status which the list contains
  const statusSet = new Set();
  items.forEach((item) => {
    statusSet.add(item.Status);
  });

  const sortedStatusValues = Array.from(statusSet);

  // case we have to sort by client
  sortableItems.sort((a, b) => {
    if (key === "Client") {
      const nameA = a[key].toUpperCase();
      const nameB = b[key].toUpperCase();

      if (nameA < nameB) {
        return direction === 1 ? -1 : 1;
      }
      if (nameA > nameB) {
        return direction === 1 ? 1 : -1;
      }
      return 0;
    }

    // case we have to sort by status
    if (key === "Status") {
      const aStatus = a.Status === "In Progress" ? "" : a.Status;
      const bStatus = b.Status === "In Progress" ? "" : b.Status;

      if (aStatus === bStatus) {
        return direction === 1 ? a[key] - b[key] : b[key] - a[key];
      }

      const aStatusIndex = sortedStatusValues.indexOf(aStatus);
      const bStatusIndex = sortedStatusValues.indexOf(bStatus);

      return direction === 1
        ? aStatusIndex - bStatusIndex
        : bStatusIndex - aStatusIndex;
    }

    // case we have to sort by date
    if (key === "Date") {
      const dateA = new Date(a[key]);
      const dateB = new Date(b[key]);

      return direction === 1 ? dateA - dateB : dateB - dateA;
    }

    return direction === 1 ? a[key] - b[key] : b[key] - a[key];
  });

  return sortableItems;
};

export default sorting;
