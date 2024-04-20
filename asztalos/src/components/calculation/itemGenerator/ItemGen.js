import React from "react";
const keretScript = {
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
  CurrentScripts: ["PFLScript"],
};

const PFLScript = {
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
};
const scripts = { keretScript, PFLScript };

function processScript(script, measurements, thickness) {
  const { config, items, CurrentScripts } = script;
  const resultItems = [];

  for (let item of items) {
    let [length, width, cantType, longCant, shortCant, pcs, type] = item;
    const frameHeight = measurements.height;
    const frameDepth = measurements.depth;
    const frameWidth = measurements.width;
    longCant = parseInt(longCant);
    shortCant = parseInt(shortCant);
    pcs = parseInt(pcs);

    length = length.replace("measurements.height", frameHeight);
    length = length.replace("measurements.width", frameWidth);
    length = length.replace("measurements.depth", frameDepth);
    length = length.replace("thickness", thickness);

    length = eval(length);
    length = parseFloat(length);

    width = width.replace("measurements.length", frameHeight);
    width = width.replace("measurements.width", frameWidth);
    width = width.replace("measurements.depth", frameDepth);
    width = width.replace("thickness", thickness);

    width = eval(width);
    width = parseFloat(width);

    if (cantType === "2" || cantType === "42") {
      if (shortCant > 0) {
        length = length - shortCant * 2;
      }
      if (longCant > 0) {
        width = width - longCant * 2;
      }
    }

    if (cantType === "1") {
      if (shortCant > 0) {
        length = length - shortCant * 1;
      }
      if (longCant > 0) {
        width = width - longCant * 1;
      }
    }

    const newItem = {
      length,
      width,
      cantType,
      longCant,
      shortCant,
      pcs,
      type,
    };

    resultItems.push(newItem);
  }
  console.log(CurrentScripts);

  if (CurrentScripts) {
    for (let script of CurrentScripts) {
      const currentScript = scripts[script];
      const currentResult = processScript(
        currentScript,
        measurements,
        thickness
      );
      console.log(currentResult);
      console.log(Object(currentResult));
      currentResult.resultItems.map((item) => {
        resultItems.push(item);
      });
    }

    //itt kell futtatni az aktuális scriptet, annyi, hogy jelenleg a script egy string
    //és át kell alakítani, hogy hivatkozzon az adott scriptre
    //resultItems.push(processScript(script)); így kellene futtatni
  }

  return {
    resultItems,
  };
}

//
function ItemGen() {
  // Tesztelés

  const measurements = {
    height: 1000,
    width: 500,
    depth: 320,
  };

  const thickness = 18;

  const processedScript = processScript(keretScript, measurements, thickness);
  console.log(processedScript);
}

export default ItemGen;
