// ModelUtils.js
export const parseStringToArray = (str) => {
    if (!str) return []; // Üres vagy null string esetén üres tömböt ad vissza
    const matches = str.match(/\[.*?\]/g); // Keresd meg az összes zárójelbe tett tömböt
    return matches.map((match) =>
      match.replace(/[\[\]']+/g, "").split(",").map(Number)
    );
  };
  
  export const convertToRadians = (degreesArray) =>
    degreesArray.map((degree) => degree * (Math.PI / 180));

export const validateObjectData = (data) => {
    if (!Array.isArray(data)) {
      console.error("Invalid object data: Must be an array of objects.");
      return [];
    }
  
    return data.filter((item) => {
      if (!item.size || !item.position || !item.rotation) {
        console.warn("Missing required properties in object:", item);
        return false;
      }
      return true;
    });
  };
  