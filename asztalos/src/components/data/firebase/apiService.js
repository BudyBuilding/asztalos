//apiService.js
import store from "../store/store"; // Redux store importálása

import {
  getClientsSuccess,
  getWorksSuccess,
  addClientSuccess,
  getScriptsSuccess,
  addScriptsSuccess,
  addObjectSuccess,
  selectObject,
} from "../store/actions/actions"; // Frissítsd az elérési utat, ha szükséges

const BASE_URL = "https://api.example.com";
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
];
const works = [
  // Chereji Clau munkái
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
  // Dummy munkák minden klienshez
  // Minden klienshez 4-4 dummy munkát adok
  // Dummy munkák generálása
  ...Array.from({ length: 19 * 4 }, (_, i) => {
    const randomYear = 2024;
    const randomMonth = Math.floor(Math.random() * 12) + 1; // 1-12 hónap
    const randomDay = Math.floor(Math.random() * 28) + 1; // 1-28 nap (figyelve a hónapokra)

    const randomPrice = Math.floor(Math.random() * 2000) + 1000; // 1000-2999 RON között
    const randomPaid = Math.floor(Math.random() * randomPrice); // 0-Price között

    return {
      workId: 10 + i,
      ClientId: (i % 19) + 1,
      Date: `${randomYear}-${String(randomMonth).padStart(2, "0")}-${String(
        randomDay
      ).padStart(2, "0")}`,
      Client: clients[i % 19].Name,

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
        width: 200,
        height: 100,
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
        width: 180,
        height: 200,
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
        width: 180,
        height: 200,
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
        width: 180,
        height: 200,
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
        width: 180,
        height: 200,
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
export const getClients = async () => {
  try {
    // Itt lehetne az API hívást megvalósítani
    store.dispatch(getClientsSuccess(clients));
  } catch (error) {
    console.error("Error while fetching clients:", error);
    throw error;
  }
};

export const getWorks = async () => {
  try {
    // Itt lehetne az API hívást megvalósítani
    store.dispatch(getWorksSuccess(works));
  } catch (error) {
    console.error("Error while fetching works:", error);
    throw error;
  }
};

export const addClient = (clientData) => {
  return async (dispatch) => {
    try {
      const newClient = {
        ClientId: Math.floor(Math.random() * 1000000), // Random szám generálása
        Name: clientData.name,
        Tel: clientData.tel,
        Address: clientData.address,
      };

      dispatch(addClientSuccess(newClient));
      return newClient;
    } catch (error) {
      console.error("Error while adding client:", error);
      throw error;
    }
  };
};

export const addColor = (colorObj) => {
  return (dispatch) => {
    dispatch({
      type: "ADD_COLOR",
      payload: colorObj,
    });
  };
};

export const addScript = (script) => {
  return async (dispatch) => {
    try {
      dispatch(addScriptsSuccess(script));
      return script;
    } catch (error) {
      console.error("Error while adding client:", error);
      throw error;
    }
  };
};

export const addObject = (object) => {
  return async (dispatch) => {
    try {
      dispatch(addObjectSuccess(object));
      return object;
    } catch (error) {
      console.error("Error while adding object:", error);
      throw error;
    }
  };
};

export const selectingObject = async (objectKey) => {
  try {
    store.dispatch(selectObject(objectKey));
  } catch (error) {
    console.error("Error while fetching objects:", error);
    throw error;
  }
};
