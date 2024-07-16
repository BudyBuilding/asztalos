import axiosInstance from "./mainApi";
import store from "../store/store";
import {
  addImage,
  addMoreImages,
  deleteImage,
  updateImage,
} from "../store/actions/imageStoreFunctions";

// Get all images from the server
const getAllImagesApi = async () => {
  try {
    const response = await axiosInstance.get("/images");
    console.log("Loading images from server response: ", response);
    if (response.status === 200) {
      // Assuming addMoreImages exists
      store.dispatch(addMoreImages(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching images:", error);
    throw error;
  }
};
////////////////////////////

const base64ToBlob = (base64, contentType = "") => {
  // Ellenőrizd és távolítsd el a `data:image/jpeg;base64,` prefixet
  if (base64.startsWith("data:image/")) {
    base64 = base64.split(",")[1];
  }

  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

const base64ToFile = (base64, filename, contentType) => {
  const blob = base64ToBlob(base64, contentType);
  return new File([blob], filename, { type: contentType });
};

const createImageApi = async (imageData, fileName) => {
  console.log(imageData);
  const contentType = "image/jpeg"; // vagy bármilyen más megfelelő MIME típus
  const filename = `${fileName}.jpg`; // a fájl neve

  // Alakítsd a base64 stringet fájllá
  const file = base64ToFile(imageData, filename, contentType);

  const formData = new FormData();
  formData.append("image", file);

  // Ellenőrzés céljából iteráljuk a FormData tartalmát
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    const response = await axiosInstance.post(`/images/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    console.error("Error while uploading image:", error);
    throw error;
  }
};
///////////////////////

export default {
  getAllImagesApi,
  // deletedImageApi,
  // updatedImageApi,
  createImageApi,
};
