import { api } from "./client"; 

export const recommendationsApi = {
  get: async (lat, lng, radiusKm, type, budget) => {
    const res = await api.get(
      `/api/recommendations?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}&type=${type}&budget=${budget}`
    );
    return res.data;
  },
  getDescription: async (name) => {
    try {
        const res = await api.get("/api/recommendations/description", {
            params: { name }
        });
        console.log("Description response for", name, ":", JSON.stringify(res.data));
        const data = res.data;
        if (!data || data.trim() === "") return null;
        return data;
    } catch (e) {
        console.log("Description error:", e.message);
        return null;
    }
}
};
