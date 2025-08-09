// src/data/api/reportApi.js
import axiosInstance from "./mainApi";
import store from "../store/store";
import {
  addReportTemplates,
  upsertReportTemplate,
  removeReportTemplate
} from "../store/actions/reportStoreFunctions";

// --- Templates (admin) ---
const getAllReportTemplatesApi = async () => {
  const res = await axiosInstance.get("/report-templates");
  if (res.status === 200) store.dispatch(addReportTemplates(res.data));
  return res.data;
};

const createReportTemplateApi = (payload) => async (dispatch) => {
  console.log("Creating report template:", payload);
  const res = await axiosInstance.post("/report-templates", payload);
  dispatch(upsertReportTemplate(res.data));
  return res.data;
};

const updateReportTemplateApi = (id, payload) => async (dispatch) => {
  const res = await axiosInstance.put(`/report-templates/${id}`, payload);
  dispatch(upsertReportTemplate(res.data));
  return res.data;
};

const deleteReportTemplateApi = (id) => async (dispatch) => {
  await axiosInstance.delete(`/report-templates/${id}`);
  dispatch(removeReportTemplate(id));
};

// --- Futatás / export ---
/**
 * runReportApi – bináris fájlt ad vissza (PDF/XLSX/CSV, stb.)
 * @param {string} templateId
 * @param {string} format – pl. 'PDF' | 'XLSX' | 'CSV'
 * @param {object} params – kulcs-érték párok a paraméterekhez
 */
const runReportApi = async (templateId, format, params = {}) => {
  const res = await axiosInstance.post(
    `/report-templates/${templateId}/run?format=${encodeURIComponent(format)}`,
    params,
    { responseType: "blob" }
  );
  const disposition = res.headers["content-disposition"] || "";
  const m = /filename\*?=(?:UTF-8'')?([^;]+)/i.exec(disposition);
  const filename = m
    ? decodeURIComponent(m[1].replace(/"/g, ""))
    : `report.${format.toLowerCase()}`;
  return { blob: res.data, filename };
};

const getAvailableFormatsApi = async () => {
  const res = await axiosInstance.get("/report-templates/formats");
  return res.data; // pl. ["PDF","XLSX","CSV"]
};

export default {
  getAllReportTemplatesApi,
  createReportTemplateApi,
  updateReportTemplateApi,
  deleteReportTemplateApi,
  runReportApi,
  getAvailableFormatsApi
};
