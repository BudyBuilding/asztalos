import { addObject } from "../data/firebase/apiService";
import store from "../data/store/store";
const objects = [
  {
    name: "All",
    key: 0,
    values: {
      red: 5,
      blue: 10,
      table: 3,
      chair: 8,
    },
    items: {
      0: {
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      1: {
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 2,
        pcs: 2,
        type: "121 FS 01",
      },
      2: {
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
    },
  },
  {
    name: "Sofa",
    key: 1,
    values: {
      color: "green",
      size: {
        width: 700,
        height: 700,
        depth: 250,
      },
    },
    items: {
      0: {
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      1: {
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      2: {
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
    },
  },
  {
    name: "Bed",
    key: 2,
    values: {
      color: "blue",
      size: {
        width: 500,
        height: 700,
        depth: 250,
      },
    },
    items: {
      0: {
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      1: {
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      2: {
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
    },
  },
  {
    name: "Bed1",
    key: 3,
    values: {
      color: "blue",
      size: {
        width: 500,
        height: 700,
        depth: 250,
      },
    },
    items: {
      0: {
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      1: {
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      2: {
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
    },
  },
  {
    name: "Bed2",
    key: 4,
    values: {
      color: "blue",
      size: {
        width: 500,
        height: 700,
        depth: 250,
      },
    },
    items: {
      0: {
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      1: {
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      2: {
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
    },
  },
  {
    name: "Bed3",
    key: 5,
    values: {
      color: "blue",
      size: {
        width: 500,
        height: 700,
        depth: 250,
      },
    },
    items: {
      0: {
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      1: {
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      2: {
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
    },
  },
];

export const addallobjects = () => {
  objects.forEach((object) => {
    store.dispatch(addObject(object));
  });
};

addallobjects();