import { api } from "./client";

export const locationsApi = {
  getAll: async () => (await api.get("/api/locations")).data,

  nearby: async (lat, lng, radiusKm) =>
    (await api.get("/api/locations/nearby", {
      params: { lat, lng, radiusKm },
    })).data,

  create: async (location) => {
  return (
    await api.post("/api/locations/save", location, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
  ).data;
},

 join: async (locationId) => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  if (!userId) throw new Error("No userId in localStorage");
  if(!token) throw new Error("No token in localStorage");

  const res = await api.post(
    `/api/locations/${locationId}/join`,
    null,
    {
      params: { userId },
      headers: {Authorization: `Bearer ${token}`},
    }
  );
  return res.data;
},

joined: async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token in localStorage");

    const res = await api.get("/api/locations/joined");
    return res.data;
  },


  leave: async (locationId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) throw new Error("No userId in localStorage");

    await api.post(
      `/api/locations/${locationId}/leave`,
      null,
      {
        params: { userId },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
  },

  presence: async (locationId) => {
    return (await api.get(`/api/locations/${locationId}/presence`)).data;
  },
};
