import { api } from "./client";

export const hostRequestApi = {
  submit: async (reason) =>
    (await api.post("/api/host-requests", { reason })).data,

  myRequests: async () =>
    (await api.get("/api/host-requests/my")).data,
};