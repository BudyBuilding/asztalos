// Importing necessary dependencies and action types
import axiosInstance from "./mainApi";
import store from "../store/store"; // Assuming this is your Redux store setup
import {
  addColor,
  deleteColor,
  updateColor,
} from "../store/actions/colorStoreFunctions"; // Assuming these are your Redux actions
import { useDispatch } from "react-redux";
import imageApi from "./imageApi";

// Get all colors from the server
const getAllColorsApi = async () => {
  try {
    const response = await axiosInstance.get("/colors");
    console.log("Loading colors from server response: ", response);
    if (response.status === 200) {
      // Assuming addMoreColors does not exist, so dispatching addColor instead
      response.data.forEach((color) => store.dispatch(addColor(color))); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching colors:", error);
    throw error;
  }
};

// Delete a color by its ID
const deleteColorApi = (colorId) => {
  return async (dispatch) => {
    try {
      await axiosInstance.delete(`/colors/${colorId}`);
      console.log("Color deleted successfully.");
      dispatch(deleteColor(colorId));
    } catch (error) {
      console.error("Error while deleting color:", error);
      throw error;
    }
  };
};
/*
// Update a color by its ID with new data
const updateColorApi = (colorId, updatedColorData) => {
  console.log("Updating color with ID:", colorId, "and data:", updatedColorData);                
  return async (dispatch) => {
    try {
      const response = await axiosInstance.put(
        `/colors/${colorId}`,
        updatedColorData
      );
      dispatch(updateColor(response.data));
      console.log("Color updated successfully.");
      return response.data;
    } catch (error) {
      console.error("Error while updating color:", error);
      throw error;
    }
  };
};*/
// Update a color by its ID with new data and optional image
const updateColorApi = (colorId, updatedColorData, imageData) => {
  console.log(
    "Updating color with ID:", 
    colorId, 
    "data:", 
    updatedColorData, 
    "hasImage?", 
    Boolean(imageData)
  );
  return async (dispatch) => {
    try {
      // Ha van imageData, akkor építsük be a payload-ba
      const payload = {
        ...updatedColorData,
        ...(imageData
          ? {
              // previewImage felől érkező "data:image/xxx;base64,AAAA..." string
              imageContentType: imageData.split(";")[0].split(":")[1],
              imageData: imageData.split(",")[1],
            }
          : {}),
      };

      const response = await axiosInstance.put(
        `/colors/${colorId}`,
        payload
      );
      dispatch(updateColor(response.data));
      console.log("Color updated successfully.");
      return response.data;
    } catch (error) {
      console.error("Error while updating color:", error);
      throw error;
    }
  };
};
// Create a new color
const createColorApi = (colorData, imageData) => {
  return async (dispatch) => {
    try {
      console.log("adding the image first");
      // Step 1: Upload the image and get the image ID
      const imageResponse = await imageApi.createImageApi(
        imageData,
        colorData.name
      );
      const imageId = imageResponse.data.imageId; // Adjust according to your API response structure

      // Step 2: Add the imageId to the color data
      const colorDataWithImageId = { ...colorData, imageId: imageId };

      // Step 3: Create the color with the imageId
      const colorResponse = await axiosInstance.post(
        `/colors`,
        colorDataWithImageId
      );
      dispatch(addColor(colorResponse.data));
      console.log("Color added successfully:", colorResponse);
      return colorResponse.data;
    } catch (error) {
      console.error("Error while adding color:", error);
      throw error;
    }
  };
};

export default {
  getAllColorsApi,
  deleteColorApi,
  updateColorApi,
  createColorApi,
};
