// Actions
export const addImage = (image) => ({
  type: "ADD_IMAGE",
  payload: image,
});

export const addMoreImages = (images) => ({
  type: "ADD_MORE_IMAGES",
  payload: Array.isArray(images) ? images : [images], // Ensure payload is an array
});

export const replaceStoreWithImage = (image) => ({
  type: "REPLACE_IMAGE",
  payload: image,
});

export const replaceStoreWithMoreImages = (images) => ({
  type: "REPLACE_MORE_IMAGES",
  payload: images,
});

export const updateImage = (modifiedImage) => ({
  type: "UPDATE_IMAGE",
  payload: modifiedImage,
});

export const deleteImage = (imageId) => ({
  type: "DELETE_IMAGE",
  payload: imageId,
});

export const selectImage = (imageId) => ({
  type: "SELECT_IMAGE",
  payload: imageId,
});

export const setImageLoading = (loading) => ({
  type: "SET_IMAGE_LOADING",
  payload: loading,
});

///////////
// Initial state
const initialState = {
  images: [],
  selectedImage: "0",
};

///////////
// Reducers
export const imageReducer = (state = initialState.images, action) => {
  switch (action.type) {
    case "ADD_IMAGE":
      if (!state.some((obj) => obj.imageId === action.payload.imageId)) {
        return [...state, action.payload];
      }
      return state; // Return the state if the image is already in the store
    case "ADD_MORE_IMAGES":
      const newImages = action.payload.filter(
        (image) =>
          !state.some(
            (existingImage) => existingImage.imageId === image.imageId
          )
      );
      return [...state, ...newImages];
    case "REPLACE_IMAGE":
      return [action.payload];
    case "REPLACE_MORE_IMAGES":
      return action.payload;
    case "UPDATE_IMAGE":
      return state.map((obj) =>
        obj.imageId === action.payload.imageId ? action.payload : obj
      );
    case "DELETE_IMAGE":
      return state.filter((obj) => obj.imageId !== action.payload);
    default:
      return state;
  }
};

export const selectedImageReducer = (
  state = initialState.selectedImage,
  action
) => {
  switch (action.type) {
    case "SELECT_IMAGE":
      return action.payload;
    default:
      return state;
  }
};
