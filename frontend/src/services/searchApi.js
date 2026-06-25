import { getTours } from "./tourApi";

export const searchTours = (params = {}) => {
  return getTours(params);
};