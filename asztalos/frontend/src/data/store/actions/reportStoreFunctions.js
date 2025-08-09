// src/data/store/actions/reportStoreFunctions.js
export const addReportTemplates = (templates) => ({
  type: "reports/addAll",
  payload: templates
});

export const upsertReportTemplate = (template) => ({
  type: "reports/upsert",
  payload: template
});

export const removeReportTemplate = (id) => ({
  type: "reports/remove",
  payload: id
});

// Egyszerű reducer a template-ekhez
const initial = { templates: [] };

export const reportsReducer = (state = initial, action) => {
  switch (action.type) {
    case "reports/addAll":
      return { ...state, templates: action.payload };
    case "reports/upsert": {
      const t = action.payload;
      const idx = state.templates.findIndex((x) => x.id === t.id);
      if (idx >= 0) {
        const next = state.templates.slice();
        next[idx] = t;
        return { ...state, templates: next };
      }
      return { ...state, templates: [...state.templates, t] };
    }
    case "reports/remove":
      return {
        ...state,
        templates: state.templates.filter((x) => x.id !== action.payload)
      };
    default:
      return state;
  }
};
