import store from "./store/store";
export const getUser = () => {
  return (dispatch) => {
    const user = store.getState().user;
    return user;
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
