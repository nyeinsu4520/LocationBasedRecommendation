import { api } from "./client";

export const adminApi = {
  // Host requests
  getPendingRequests: async () =>
    (await api.get("/api/admin/host-requests/pending")).data,

  getAllRequests: async () =>
    (await api.get("/api/admin/host-requests")).data,

  approveRequest: async (id) =>
    (await api.post(`/api/admin/host-requests/${id}/approve`)).data,

  rejectRequest: async (id) =>
    (await api.post(`/api/admin/host-requests/${id}/reject`)).data,

  // Users
  getAllUsers: async () =>
    (await api.get("/api/admin/users")).data,

  banUser: async (id) =>
    (await api.post(`/api/admin/users/${id}/ban`)).data,

  unbanUser: async (id) =>
    (await api.post(`/api/admin/users/${id}/unban`)).data,

  demoteUser: async (id) =>
    (await api.post(`/api/admin/users/${id}/demote`)).data,

    getAllEvents: async () =>
    (await api.get("/api/admin/events")).data,

getCancelRequests: async () =>
    (await api.get("/api/admin/cancel-requests")).data,

approveCancelRequest: async (eventId) =>
    (await api.post(`/api/admin/events/${eventId}/approve-cancel`)).data,

rejectCancelRequest: async (eventId) =>
    (await api.post(`/api/admin/events/${eventId}/reject-cancel`)).data,
};