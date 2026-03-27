import { api } from "./client"; 

export const recommendationsApi = {
  get: async (lat, lng, radiusKm, type, budget) => {
    const res = await api.get(
      `/api/recommendations?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}&type=${type}&budget=${budget}`
    );
    return res.data;
  }
};
