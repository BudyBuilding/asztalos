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

    length = length.replace("measurements.height", frameHeight);
    length = length.replace("measurements.width", frameWidth);
    length = length.replace("measurements.depth", frameDepth);
    length = length.replace("config.cantType", cantType);
    length = length.replace("thickness", thickness);
    //  length = length.replace("doorNumber", doorNumber);

    width = width.replace("measurements.length", frameHeight);
    width = width.replace("measurements.width", frameWidth);
    width = width.replace("measurements.depth", frameDepth);
    width = width.replace("config.cantType", cantType);
    width = width.replace("thickness", thickness);
    // width = width.replace("doorNumber", doorNumber);

    if (pcs.includes("config.doorNumber")) {
      length = length.replace("config.doorNumber", config.doorNumber);
      width = width.replace("config.doorNumber", config.doorNumber);
      pcs = pcs.replace("config.doorNumber", config.doorNumber);
    }

    length = eval(length);
    length = parseFloat(length);

    width = eval(width);
    width = parseFloat(width);

    longCant = parseInt(longCant);
    shortCant = parseInt(shortCant);
    pcs = parseInt(pcs);

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

  if (CurrentScripts) {
    for (let script of CurrentScripts) {
      const currentScript = scripts[script];
      const currentResult = processScript(
        currentScript,
        measurements,
        thickness
      );
      currentResult.resultItems.map((item) => {
        resultItems.push(item);
      });
    }
  }

  return {
    resultItems,
  };
}

export default processScript;
