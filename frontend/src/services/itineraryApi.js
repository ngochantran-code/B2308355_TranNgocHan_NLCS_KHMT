import api from "./api";

export const getItineraries = () => {
  return api.get("/itineraries");
};

export const getItineraryById = (id) => {
  return api.get(`/itineraries/${id}`);
};

export const getItinerariesByTour = (tourId) => {
  return api.get(`/itineraries/tour/${tourId}`);
};

export const createItinerary = (data) => {
  return api.post("/itineraries", data);
};

export const updateItinerary = (id, data) => {
  return api.put(`/itineraries/${id}`, data);
};

export const deleteItinerary = (id) => {
  return api.delete(`/itineraries/${id}`);
};