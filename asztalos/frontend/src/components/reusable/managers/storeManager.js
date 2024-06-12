//storeManager.js
import {
  addClient,
  getClientsFromStore,
  addObject,
  getClients,
  addScript,
  addWork,
  getAllWorks,
} from "../../data/api/apiService";
import store from "../../data/store/store";

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
    items: [
      {
        itemKey: 0,
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },

      {
        itemKey: 1,
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 2,
        pcs: 2,
        type: "121 FS 01",
      },

      {
        itemKey: 2,
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
    ],
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
      position: {
        x: -2150,
        y: 650,
        z: -1125,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    items: [
      {
        itemKey: 0,
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      {
        itemKey: 1,
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      {
        itemKey: 2,
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
    ],
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
      position: {
        x: -1550,
        y: 650,
        z: -1125,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    items: [
      {
        itemKey: 0,
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      {
        itemKey: 1,
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      {
        itemKey: 2,
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
    ],
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
      position: {
        x: -1050,
        y: 650,
        z: -1125,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    items: [
      {
        itemKey: 0,
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      {
        itemKey: 1,
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      {
        itemKey: 2,
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
    ],
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
      position: {
        x: -550,
        y: 650,
        z: -1125,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    items: [
      {
        itemKey: 0,
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      {
        itemKey: 1,
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      {
        itemKey: 2,
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
    ],
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
      position: {
        x: -50,
        y: 650,
        z: -1125,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    items: [
      {
        itemKey: 0,
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      {
        itemKey: 1,
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
      {
        itemKey: 2,
        length: 464,
        width: 318,
        cantType: "2",
        longCant: 1,
        shortCant: 0,
        pcs: 2,
        type: "121 FS 01",
      },
    ],
  },
];

const scripts = [
  {
    scriptId: 0,
    room: "All",
    scriptName: "PFLSCriptall",
    config: {},
    items: [
      [
        "measurements.height - 5",
        "measurements.width - 5",
        "0",
        "0",
        "0",
        "1",
        "PFL",
      ],
    ],
  },
  {
    scriptId: 1,
    room: "All",
    scriptName: "KeretScript",
    config: {
      PFL: true,
    },

    items: [
      ["measurements.height", "measurements.depth", "2", "1", "2", "2", "side"],
      [
        "measurements.width - 2 * thickness",
        "measurements.depth",
        "2",
        "1",
        "0",
        "2",
        "roof",
      ],
    ],
    Scripts: ["PFLScript"],
  },
  {
    scriptId: 2,
    room: "All",
    scriptName: "DoorScriptAll",
    config: {
      doorNumber: 2,
      distBetweenTheDoors: 3,
      distAroundTheDoors: 2,
      horizontal: false,
      doorCantType: 2,
    },
    items: [
      [
        `config.horizontal ? (measurements.height - (config.doorNumber - 1) * config.distBetweenTheDoors -  2 * config.doorCantType) / config.doorNumber :
      measurements.height  - 2 * config.doorCantType `,
        `config.horizontal ? measurements.width - 2 * config.doorCantType :
       measurements.width - (config.doorNumber - 1) * config.distBetweenTheDoors  - 2 * config.doorCantType`,
        "2",
        "2",
        "2",
        "config.doorNumber",
        "door",
      ],
    ],
    Scripts: [],
  },
  {
    scriptId: 3,
    room: "Kitchen",
    scriptName: "DoorScriptkitchen",
    config: {
      doorNumber: 2,
      distBetweenTheDoors: 3,
      distAroundTheDoors: 2,
      horizontal: false,
      doorCantType: 2,
    },
    items: [
      [
        `config.horizontal ? measurements.height - (config.doorNumber - 1) * config.distBetweenTheDoors - 2 * config.distAroundTheDoors - 2 * config.doorCantType :
      measurements.height - 2 * config.distAroundTheDoors - 2 * config.doorCantType`,
        `config.horizontal ? measurements.width - 2 * config.distAroundTheDoors - 2 * config.doorCantType :
       measurements.width - (config.doorNumber - 1) * config.distBetweenTheDoors - 2 * config.distAroundTheDoors - 2 * config.doorCantType`,
        "2",
        "2",
        "2",
        "2",
        "door",
      ],
    ],
    Scripts: [],
  },
  {
    scriptId: 4,
    room: "Wardrobe",
    scriptName: "DoorScriptwardrobe",
    config: {
      doorNumber: 2,
      distBetweenTheDoors: 3,
      distAroundTheDoors: 2,
      horizontal: false,
      doorCantType: 2,
    },
    items: [
      [
        `config.horizontal ? measurements.height - (config.doorNumber - 1) * config.distBetweenTheDoors - 2 * config.distAroundTheDoors - 2 * config.doorCantType :
      measurements.height - 2 * config.distAroundTheDoors - 2 * config.doorCantType`,
        `config.horizontal ? measurements.width - 2 * config.distAroundTheDoors - 2 * config.doorCantType :
       measurements.width - (config.doorNumber - 1) * config.distBetweenTheDoors - 2 * config.distAroundTheDoors - 2 * config.doorCantType`,
        "2",
        "2",
        "2",
        "2",
        "door",
      ],
    ],
    Scripts: [],
  },
  {
    scriptId: 5,
    room: "Kitchen",
    scriptName: "DoorScriptkithcennr5",
    config: {
      doorNumber: 2,
      distBetweenTheDoors: 3,
      distAroundTheDoors: 2,
      horizontal: false,
      doorCantType: 2,
    },
    items: [
      [
        `config.horizontal ? measurements.height - (config.doorNumber - 1) * config.distBetweenTheDoors - 2 * config.distAroundTheDoors - 2 * config.doorCantType :
      measurements.height - 2 * config.distAroundTheDoors - 2 * config.doorCantType`,
        `config.horizontal ? measurements.width - 2 * config.distAroundTheDoors - 2 * config.doorCantType :
       measurements.width - (config.doorNumber - 1) * config.distBetweenTheDoors - 2 * config.distAroundTheDoors - 2 * config.doorCantType`,
        "2",
        "2",
        "2",
        "2",
        "door",
      ],
    ],
    Scripts: [],
  },
];

export const manage = async () => {
  try {
    const clients = await getClients();
    // Összes munka lekérése a backendről
    const works = await getAllWorks();

    store.dispatch(getAllWorks(works));
    store.dispatch(getClients(clients));

    objects.forEach((object) => {
      store.dispatch(addObject(object));
    });

    scripts.forEach((script) => {
      store.dispatch(addScript(script));
    });
  } catch (error) {
    console.error("Error fetching clients and works:", error);
    throw error;
  }
};
