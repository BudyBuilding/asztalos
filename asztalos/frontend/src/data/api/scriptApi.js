// scriptApi.js
import axiosInstance from "./mainApi";
import store from "../store/store"; // Redux store importálása
import {
  addScript,
  addMoreScripts,
  deleteScript,
  updateScript,
  updateScriptItem,
  addScriptItem
} from "../store/actions/scriptStoreFunctions";
import { useDispatch } from "react-redux";

const getAllScriptsApi = async () => {
  try {
    const response = await axiosInstance.get("/scripts");
    console.log("Loading scripts from server response: ", response);
    if (response.status === 200) {
      store.dispatch(addMoreScripts(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching scripts:", error);
    throw error;
  }
};

// Delete a script
const deleteScriptApi = (scriptId) => {
  return async (dispatch) => {
    try {
      console.log(scriptId);
      await axiosInstance.delete(`/scripts/${scriptId}`);
      console.log("Script deleted successfully.");
      dispatch(deleteScript(scriptId));
    } catch (error) {
      console.error("Error while deleting script:", error);
      throw error;
    }
  };
};
////////////////////
      const updateScriptApi = (scriptObject, imageFile) => {
        return async (dispatch) => {
          try {
            console.log("Updating script with data:", scriptObject, "Image file:", imageFile);
            const formData = new FormData();
            formData.append(
              "script",
              new Blob([JSON.stringify(scriptObject)], { type: "application/json" })
            );
            if (imageFile) {
              formData.append("image", imageFile);
            }
            const id = scriptObject.script_id;
            const { data } = await axiosInstance.put(`/scripts/${id}`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });
            console.log("Script updated successfully:", data);
            dispatch(updateScript(data));
            return data;
          } catch (error) {
            console.error("Error while updating script:", error);
            throw error;
          }
        };
      };



// Updating section
const updateScriptItemApi = (ScriptItem, updatedScriptData) => {
  return async (dispatch) => {
    try {
      console.log("ScriptItem: ", ScriptItem);
      await axiosInstance.put(`/script-item/${ScriptItem.itemId}`, ScriptItem);
      dispatch(updateScriptItem(ScriptItem));
    } catch (error) {
      console.error("Error while updating script:", error);
      throw error;
    }
  };
};
/*
const createScriptApi = (scriptData) => {
  return async (dispatch) => {
    try {
      console.log("creating new script");
      const response = await axiosInstance.post(`/scripts`, scriptData);
      console.log("Script added successfully:", response);

      dispatch(addScript(response.data));
      return response.data;
    } catch (error) {
      console.error("Error while adding script:", error);
      throw error;
    }
  };
};*/

//***************** */
const createScriptApi = (scriptData, imageFile) => {
    return async (dispatch) => {
      try {
        console.log("creating new script");
        const formData = new FormData();
        formData.append(
          "metadata",
          new Blob([JSON.stringify(scriptData)], { type: "application/json" })
        );
        if (imageFile) {
          formData.append("image", imageFile);
        }
        const response = await axiosInstance.post(
          `/scripts`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        console.log("Script added successfully:", response);
        dispatch(addScript(response.data));
        return response.data;
      } catch (error) {
        console.error("Error while adding script:", error);
        throw error;
      }
    };
  };
//***************** */
/*
const createScriptItemApi = (scriptData) => {
  return async (dispatch) => {
    try {
      console.log("creating new script");
      const response = await axiosInstance.post(`/scripts`, scriptData);
      console.log("Script added successfully:", response);

      dispatch(addScriptItem(response.data));
      return response.data;
    } catch (error) {
      console.error("Error while adding script:", error);
      throw error;
    }
  };
};*/


/****************** */
const createScriptItemApi = (itemData) => {
    return async (dispatch) => {
      try {
        console.log("creating new script item");
        const response = await axiosInstance.post(
          `/script-item`,
          itemData,
          { headers: { "Content-Type": "application/json" } }
        );
        console.log("Script item added successfully:", response);
        dispatch(addScriptItem(response.data));
        return response.data;
      } catch (error) {
        console.error("Error while adding script item:", error);
        throw error;
      }
    };
  };

/****************** */














const getScriptOfUserAdminApi = (scriptId) => {
  return async (dispatch) => {
    // A függvény visszatérési értéke egy aszinkron függvény
    try {
      const response = await axiosInstance.get(`/scripts/${scriptId}`);
      //   dispatch(getScriptSuccess(response.data)); // API válasz feldolgozása és diszpácselése a store-ba
      return response.data;
    } catch (error) {
      console.error("Error fetching scripts:", error);
      throw error;
    }
  };
};

export default {
  getAllScriptsApi,
  deleteScriptApi,
  updateScriptApi,
  createScriptApi,
  createScriptItemApi,
  getScriptOfUserAdminApi,
  updateScriptItemApi
};
