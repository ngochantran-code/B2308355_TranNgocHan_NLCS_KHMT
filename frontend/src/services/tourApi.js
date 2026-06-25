import api from "./api";

export const getTours = (params = {}) => {
  return api.get("/tours", { params });
};

export const getTourById = (id) => {
  return api.get(`/tours/${id}`);
};

export const createTour = (data) => {
  return api.post("/tours", data);
};

export const updateTour = (id, data) => {
  return api.put(`/tours/${id}`, data);
};

export const deleteTour = (id) => {
  return api.delete(`/tours/${id}`);
};

export const uploadTourPDF = (formData) => {
  return api.post("/tours/upload-pdf", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};