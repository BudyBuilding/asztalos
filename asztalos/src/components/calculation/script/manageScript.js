import store from "../../data/store/store"; // Redux store importálása
import { addScript } from "../../data/firebase/apiService";

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
export const loadScripts = () => {
  scripts.forEach((script) => {
    store.dispatch(addScript(script));
  });
};

loadScripts();
