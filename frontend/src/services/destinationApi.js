import api from "./api";

export const getDestinations = () => {
  return api.get("/destinations");
};

export const getDestinationById = (id) => {
  return api.get(`/destinations/${id}`);
};

export const createDestination = (data) => {
  return api.post("/destinations", data);
};

export const updateDestination = (id, data) => {
  return api.put(`/destinations/${id}`, data);
};

export const deleteDestination = (id) => {
  return api.delete(`/destinations/${id}`);
};