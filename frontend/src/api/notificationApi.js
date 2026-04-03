import { api } from "./client";

export const notificationApi = {
    getUnread: async () =>
        (await api.get("/api/notifications")).data,

    markRead: async () =>
        (await api.post("/api/notifications/mark-read")).data,
};