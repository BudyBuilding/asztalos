import { useDispatch } from "react-redux";
import { getAllScriptItems } from "../../data/getters";
import store from "../../data/store/store";

function evaluateFormula(formula, settings) {
  const settingRegex = /\(\*(\d+)\*\)/g;
  return formula.replace(settingRegex, (match, p1) => settings[p1] || 0);
}

function processScript(currentConfig, measurements) {
  const { height, width, depth } = measurements;
  const scriptItems = store.dispatch(getAllScriptItems());

  if (scriptItems) {
    return scriptItems
      .map((item) => {
        const sizeFormula = item.size; // "[width - 2 * (*1*) + 3 * (*2*), height, depth]"
        const rotationFormula = item.rotation; // "[width - 2 * (*1*) + 3 * (*2*), height, depth]"
        const positionFormula = item.position; // "[width - 2 * (*1*) + 3 * (*2*), height, depth]"
        const qtyFormula = item.qty; // "(*3*) * (*4*)"
        console.log(sizeFormula);

        const evaluatedSize = evaluateFormula(sizeFormula, {
          ...currentConfig,
          width,
          height,
          depth,
        });
        const evaluatedRotation = evaluateFormula(rotationFormula, {
          ...currentConfig,
          width,
          height,
          depth,
        });
        const evaluatedPosition = evaluateFormula(positionFormula, {
          ...currentConfig,
          width,
          height,
          depth,
        });
        const evaluatedQty = evaluateFormula(qtyFormula, currentConfig);

        // Kiértékeljük a képleteket és tömbökké alakítjuk
        try {
          // Távolítsuk el a felesleges karaktereket
          const sanitizedSize = evaluatedSize.replace(/[\[\]]/g, "");
          const sizeSegments = sanitizedSize.split(",").map((segment) => {
            try {
              return eval(segment.trim());
            } catch (error) {
              console.error(
                `Error evaluating segment: ${segment.trim()}`,
                error
              );
              return 0; // Alapértelmezett érték hibás kiértékelés esetén
            }
          });

          const sanitizedPosition = evaluatedPosition.replace(/[\[\]]/g, "");
          const positionSegments = sanitizedPosition
            .split(",")
            .map((segment) => {
              try {
                return eval(segment.trim());
              } catch (error) {
                console.error(
                  `Error evaluating segment: ${segment.trim()}`,
                  error
                );
                return 0; // Alapértelmezett érték hibás kiértékelés esetén
              }
            });

          const sanitizedRotation = evaluatedRotation.replace(/[\[\]]/g, "");
          const rotationSegments = sanitizedRotation
            .split(",")
            .map((segment) => {
              try {
                return eval(segment.trim());
              } catch (error) {
                console.error(
                  `Error evaluating segment: ${segment.trim()}`,
                  error
                );
                return 0; // Alapértelmezett érték hibás kiértékelés esetén
              }
            });
          const size = `[${sizeSegments.join(", ")}]`; // Újra összeállítjuk a stringet szögletes zárójelekkel
          const position = `[${positionSegments.join(", ")}]`; // Újra összeállítjuk a stringet szögletes zárójelekkel
          const rotation = `[${rotationSegments.join(", ")}]`; // Újra összeállítjuk a stringet szögletes zárójelekkelr
          const qty = eval(evaluatedQty.trim());

          const material = item.material;
          const name = item.name;
          return {
            material,
            name,
            position,
            rotation,
            size,
            qty,
          };
        } catch (error) {
          console.error(`Error evaluating formulas for item: ${item}`, error);
          return null;
        }
      })
      .filter((item) => item !== null);
  }
}

export default processScript;
