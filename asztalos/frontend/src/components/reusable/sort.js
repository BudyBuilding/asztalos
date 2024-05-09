const sorting = (items, config) => {
  const { key, direction } = config;

  const sortableItems = [...items];
  const statusSet = new Set();
  items.forEach((work) => {
    statusSet.add(work.Status);
  });

  const sortedStatusValues = Array.from(statusSet);

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
