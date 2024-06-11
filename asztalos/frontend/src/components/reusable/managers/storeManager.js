//storeManager.js
import {
  addClient,
  getClientsFromStore,
  addObject,
  getClients,
  addScript,
  addWork,
} from "../../data/firebase/apiService";
import store from "../../data/store/store";
/*
const clients = [
  {
    ClientId: 1,
    Name: "John Doe",
    Tel: "+40758612749",
    Address: "123 Main Street, New York",
  },
  {
    ClientId: 2,
    Name: "Alice Smith",
    Tel: "+123456789",
    Address: "456 Park Avenue, Los Angeles",
  },
  {
    ClientId: 3,
    Name: "Michael Johnson",
    Tel: "+987654321",
    Address: "789 Maple Street, Chicago",
  },
  {
    ClientId: 4,
    Name: "Emma Davis",
    Tel: "+135792468",
    Address: "246 Elm Street, San Francisco",
  },
  {
    ClientId: 5,
    Name: "James Wilson",
    Tel: "+246813579",
    Address: "357 Oak Street, Boston",
  },
  {
    ClientId: 6,
    Name: "Sophia Martinez",
    Tel: "+369258147",
    Address: "258 Pine Street, Seattle",
  },
  {
    ClientId: 7,
    Name: "Olivia Brown",
    Tel: "+987654321",
    Address: "753 Cedar Street, Miami",
  },
  {
    ClientId: 8,
    Name: "William Taylor",
    Tel: "+456123789",
    Address: "159 Birch Street, Dallas",
  },
  {
    ClientId: 9,
    Name: "Emily Johnson",
    Tel: "+321654987",
    Address: "852 Willow Street, Houston",
  },
  {
    ClientId: 10,
    Name: "Daniel Garcia",
    Tel: "+789654123",
    Address: "369 Maple Street, Atlanta",
  },
  {
    ClientId: 11,
    Name: "Isabella Lopez",
    Tel: "+159753468",
    Address: "753 Elm Street, Philadelphia",
  },
  {
    ClientId: 12,
    Name: "Matthew Young",
    Tel: "+753159852",
    Address: "159 Pine Street, Phoenix",
  },
  {
    ClientId: 13,
    Name: "Ethan Hernandez",
    Tel: "+357159753",
    Address: "357 Oak Street, Las Vegas",
  },
  {
    ClientId: 14,
    Name: "Sofia Martinez",
    Tel: "+258963147",
    Address: "258 Cedar Street, San Diego",
  },
  {
    ClientId: 15,
    Name: "Mia Rodriguez",
    Tel: "+654321987",
    Address: "987 Maple Street, Washington D.C.",
  },
  {
    ClientId: 16,
    Name: "Alexander Wilson",
    Tel: "+951753852",
    Address: "753 Oak Street, San Antonio",
  },
  {
    ClientId: 17,
    Name: "Charlotte Gonzalez",
    Tel: "+741852963",
    Address: "147 Pine Street, Denver",
  },
  {
    ClientId: 18,
    Name: "Jacob Perez",
    Tel: "+369258147",
    Address: "258 Elm Street, Orlando",
  },
  {
    ClientId: 19,
    Name: "Ava Carter",
    Tel: "+852369741",
    Address: "369 Cedar Street, Nashville",
  },
  {
    ClientId: 20,
    Name: "Liam Scott",
    Tel: "+123987456",
    Address: "456 Birch Street, Austin",
  },
];*/

const clients = getClients();

const works = [
  {
    workId: 1,
    ClientId: 1,
    Client: "Chereji Clau",
    Date: "2024-03-29",
    Status: "Completed",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 2,
    ClientId: 1,
    Client: "Chereji Clau",
    Date: "2024-04-05",
    Status: "In Progress",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 3,
    ClientId: 1,
    Client: "Chereji Clau",
    Date: "2024-04-10",
    Status: "Pending",
    Price: 2024,
    Paid: 1500,
  },
  // Irina geta munkái
  {
    workId: 4,
    ClientId: 2,
    Client: "irina Geta",
    Date: "2024-03-30",
    Status: "Completed",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 5,
    ClientId: 2,
    Client: "irina Geta",
    Date: "2024-04-05",
    Status: "In Progress",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 6,
    ClientId: 2,
    Client: "irina Geta",
    Date: "2024-04-10",
    Status: "Pending",
    Price: 2024,
    Paid: 1500,
  },
  // Aronia munkái
  {
    workId: 7,
    ClientId: 3,
    Client: "Aronia",
    Date: "2024-03-29",
    Status: "Completed",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 8,
    ClientId: 3,
    Client: "Aronia",
    Date: "2024-04-05",
    Status: "In Progress",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 9,
    ClientId: 3,
    Client: "Aronia",
    Date: "2024-04-10",
    Status: "Pending",
    Price: 2024,
    Paid: 1500,
  },
  ...Array.from({ length: clients.length * 4 }, (_, i) => {
    const randomYear = 2024;
    const randomMonth = Math.floor(Math.random() * 12) + 1; // 1-12 hónap
    const randomDay = Math.floor(Math.random() * 28) + 1; // 1-28 nap (figyelve a hónapokra)

    const randomPrice = Math.floor(Math.random() * 2000) + 1000; // 1000-2999 RON között
    const randomPaid = Math.floor(Math.random() * randomPrice); // 0-Price között

    return {
      workId: 5 + i,
      ClientId: (i % clients.length) + 1,
      Date: `${randomYear}-${String(randomMonth).padStart(2, "0")}-${String(
        randomDay
      ).padStart(2, "0")}`,

      Status:
        i % 3 === 0 ? "Completed" : i % 3 === 1 ? "In Progress" : "Pending",
      Price: randomPrice,
      Paid: randomPaid,
    };
  }),
];

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

export const manage = () => {
  /*clients.forEach((client) => {
    store.dispatch(addClient(client));
  });*/

  works.forEach((work) => {
    store.dispatch(addWork(work));
  });

  objects.forEach((object) => {
    store.dispatch(addObject(object));
  });

  scripts.forEach((script) => {
    store.dispatch(addScript(script));
  });
};
manage();
