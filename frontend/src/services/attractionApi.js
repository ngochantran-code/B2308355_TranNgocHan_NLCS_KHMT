import api from "./api";

export const getAttractions = () => {
  return api.get("/attractions");
};

export const getAttractionById = (id) => {
  return api.get(`/attractions/${id}`);
};

export const createAttraction = (data) => {
  return api.post("/attractions", data);
};

export const updateAttraction = (id, data) => {
  return api.put(`/attractions/${id}`, data);
};

export const deleteAttraction = (id) => {
  return api.delete(`/attractions/${id}`);
};