import store from "./store/store";
export const getUser = () => {
  return (dispatch) => {
    const user = store.getState().auth.user;
    return user;
  };
};

export const getAllUsers = () => {
  return (dispatch) => {
    const users = store.getState().auth.allUsers;
    return users;
  };
};

/////////////
//client
export const getClientById = (clientId) => {
  return (dispatch) => {
    const clients = store.getState().clients;
    const client = clients.find((client) => client.clientId == clientId);
    return client;
  };
};

export const getAllClients = () => {
  return (dispatch) => {
    const clients = store.getState().clients;
    return clients;
  };
};

export const getSelectedClient = () => {
  return (dispatch) => {
    const selectedClient = store.getState().selectedClient;
    return selectedClient;
  };
};
////////////////
//work
export const getWorkById = (workId) => {
  return (dispatch) => {
    const works = store.getState().works;
    const work = works.find((work) => work.workId == workId);
    return work;
  };
};

export const getAllWorks = () => {
  return (dispatch) => {
    const works = store.getState().works;
    return works;
  };
};

export const getSelectedWork = () => {
  return (dispatch) => {
    const works = store.getState().selectedWork;
    return works;
  };
};
////////////////
//table
export const getTableById = (tableId) => {
  return (dispatch) => {
    const tables = store.getState().tables;
    const table = tables.find((table) => table.tableId == tableId);
    return table;
  };
};

export const getAllTables = () => {
  return (dispatch) => {
    const tables = store.getState().tables;
    return tables;
  };
};

////////////////
//script
export const getScriptById = (scriptId) => {
  return (dispatch) => {
    const scripts = store.getState().scripts;
    const script = scripts.find((script) => script.scriptId == scriptId);
    return script;
  };
};

export const getAllScripts = () => {
  return (dispatch) => {
    const scripts = store.getState().scripts;
    return scripts;
  };
};

export const getSelectedScript = () => {
  return (dispatch) => {
    const selectedScript = store.getState().selectedScript;
    return selectedScript;
  };
};

export const getAllScriptItems = () => {
  return (dispatch) => {
    const scriptItems = store.getState().selectedScriptItems;
    return scriptItems;
  };
};

export const getScriptItemsByWork = (workId) => {
  return (dispatch) => {
    const scriptItems = store
      .getState()
      .scriptItems.filter((item) => item.work.workId === workId);
    return scriptItems;
  };
};

export const getScriptItemsByScript = (scriptId) => {
  return (dispatch) => {
    const scriptItems = store
      .getState()
      .scriptItems.filter((item) => item.object.scriptId === scriptId);
    return scriptItems || [];
  };
};

////////////////
//object
export const getObjectById = (objectId) => {
  return (dispatch) => {
    const objects = store.getState().objects;
    const object = objects.find((object) => object.objectId == objectId);
    return object;
  };
};

export const getAllObjects = () => {
  return (dispatch) => {
    const objects = store.getState().objects;
    return objects;
  };
};

export const getLatestObject = () => {
  return (dispatch) => {
    const objects = store.getState().objects;
    if (objects.length === 0) {
      return null; // Ha nincs egyetlen objektum sem, null értékkel térünk vissza
    }

    // Megkeressük a legnagyobb objectId-jú objektumot
    const latestObject = objects.reduce((maxObject, currentObject) => {
      return currentObject.objectId > maxObject.objectId
        ? currentObject
        : maxObject;
    });

    return latestObject;
  };
};

export const getSelectedObject = () => {
  return (dispatch) => {
    const selectedObject = store.getState().selectedObject;
    return selectedObject;
  };
};

export const getAllCreatedItems = () => {
  return (dispatch) => {
    const createdItems = store.getState().createdItems;
    return createdItems;
  };
};

export const getCreatedItemsByWork = (workId) => {
  return (dispatch) => {
    const createdItems = store
      .getState()
      .createdItems.filter((item) => item.work.workId === workId);
    return createdItems;
  };
};

export const getCreatedItemsByObject = (objectId) => {
  return (dispatch) => {
    const createdItems = store
      .getState()
      .createdItems.filter((item) => item.object.objectId === objectId);
    return createdItems || [];
  };
};

export const getAllCreatedTables = () => {
  return (dispatch) => {
    const createdTables = store.getState().createdTables;
    return createdTables;
  };
};

export const getCreatedTablesByWork = (workId) => {
  return (dispatch) => {
    const createdTables = store
      .getState()
      .createdTables.filter((item) => item.work.workId === workId);
    return createdTables;
  };
};

export const getCreatedTablesByObject = (objectId) => {
  return (dispatch) => {
    const createdTables = store
      .getState()
      .createdTables.filter((item) => item.object.objectId === objectId);
    return createdTables || [];
  };
};

//////////////////
// settings
export const getSettingById = (settingId) => {
  return (dispatch) => {
    const settings = store.getState().settings;
    const setting = settings.find((setting) => setting.settingId == settingId);
    return setting;
  };
};

export const getAllSettings = () => {
  return (dispatch) => {
    const settings = store.getState().settings;
    return settings;
  };
};

/////////////////////
// colors
export const getAllColors = () => {
  return (dispatch) => {
    const colors = store.getState().colors;
    return colors;
  };
};

/////////////////////
// images
export const getAllImages = () => {
  return (dispatch) => {
    const images = store.getState().images;
    return images;
  };
};

export const getAllImageId = () => {
  return (dispatch) => {
    const images = store.getState().images;
    const imageId = [];
    images.forEach((image) => {
      imageId.push(image.image.imageId);
    });
    return imageId;
  };
};

export const getImageById = (imageId) => {
  return (dispatch, getState) => {
    const images = getState().images; // Az aktuális állapot lekérése
    //  console.log("Current images state:", images); // Logoljuk az aktuális képállapotot

    if (!images || !Array.isArray(images)) {
      //      console.log("Images state is empty or not an array:", images); // Logoljuk, ha a képállapot üres vagy nem tömb
      return null; // Üres állapot kezelése, ha szükséges
    }

    const foundImage = images.find((image) => {
      console.log(`Comparing imageId: ${image.image.imageId} == ${imageId}`);
      return image.image.imageId == imageId;
    }); // Keresés az imageId alapján

    if (foundImage) {
      console.log("Found image:", foundImage); // Logoljuk a megtalált képet
      return foundImage.data; // Visszaadjuk a megtalált kép adatait
    } else {
      console.log("Image with specified id not found:", imageId); // Logoljuk, ha nem találjuk meg a képet
      return null; // Ha nem találtunk képet, null-t adunk vissza
    }
  };
};
