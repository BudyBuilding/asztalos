const getNestedValue = (obj, key) => {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const filtering = (items, configs) => {
  console.log(configs);
  let returnItems = [];

  items.forEach(item => {
    let isMatch = true; // Alapértelmezett, hogy az elem passzol, amíg nem találunk hibát.

    configs.forEach(config => { // Minden filtert végignézünk
      const itemValue = getNestedValue(item, config.vkey); // Nested value támogatás!
      
      if (config.type === "string") {
        // Ha nincs érték vagy nem string, ne egyezzen meg
        if (itemValue !== null && itemValue !== undefined && typeof itemValue !== "string") {
          isMatch = false;
        }
        if (itemValue && typeof itemValue === "string" && !itemValue.toLowerCase().includes(config.value.toLowerCase())) {
          isMatch = false;
        }
      }

      if (config.type === "interval") {
        if (config.vkey.toLowerCase().includes("date")) {
          // Ha az itemValue null, akkor nem zárjuk ki, hanem hagyjuk továbblépni
          if (itemValue === null || itemValue === undefined) {
            return;
          }
        
          // Dátumokat átalakítjuk
          const itemDate = Date.parse(itemValue);
          const minDate  = Date.parse(config.min);
          const maxDate  = Date.parse(config.max);
        
          // Ha az itemDate nem valid dátum, akkor kizárjuk
          if (isNaN(itemDate)) {
            isMatch = false;
          }
        
          // Ha a dátum nem esik bele az intervallumba (min, max), akkor kizárjuk
          if (itemDate < minDate || itemDate > maxDate) {
            isMatch = false;
          }
        }
         else {
          // Szám értékek kezelése
          if (itemValue === null || itemValue === undefined) {
            return;
          }
          if (itemValue < config.min || itemValue > config.max) {
            isMatch = false;
          }
        }
      }

      if (config.type === "valueList") {
        // Ha itemValue null, ne zárja ki
        if (itemValue !== null && !config.value.includes(itemValue)) {
          isMatch = false;
        }
      }

      // Ha bármilyen feltétel nem teljesül, azonnal kilépünk
      if (!isMatch) return; // Kilépünk a loop-ból, ha már nem felel meg
    });

    // Ha a `isMatch` igaz, akkor hozzáadjuk az elemet
    if (isMatch) {
      returnItems.push(item);
    }
  });

  return returnItems;
};

export default filtering;
