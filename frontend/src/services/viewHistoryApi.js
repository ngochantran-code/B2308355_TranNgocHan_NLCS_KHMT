import api from "./api";

export const getViewHistoriesByUser = (userId) => {
  return api.get(`/view-histories/user/${userId}`);
};

export const createViewHistory = (data) => {
  return api.post("/view-histories", data);
};

export const deleteViewHistory = (id) => {
  return api.delete(`/view-histories/${id}`);
};
