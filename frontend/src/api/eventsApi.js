import { api } from "./client";

export const eventsApi = {
  // Get nearby host-created events
  nearby: async (lat, lng, radiusKm) =>
    (await api.get("/api/events/nearby", {
      params: { lat, lng, radiusKm },
    })).data,

  // Join an event (only works if host created it)
  join: async (eventId) =>
    (await api.post(`/api/events/${eventId}/join`, null)).data,

  // Leave an event
  leave: async (eventId) =>
    (await api.post(`/api/events/${eventId}/leave`, null)).data,

  // Events the logged-in user has joined
  joined: async () =>
    (await api.get("/api/events/joined")).data,

  // Who is attending an event
  presence: async (eventId) =>
    (await api.get(`/api/events/${eventId}/attendees`)).data,

  // Host: create an event
  create: async (event) =>
    (await api.post("/api/events", event)).data,

  // Host: their own events
  myEvents: async () =>
    (await api.get("/api/events/my-events")).data,

  // ✅ Check if current user is already a member of this event
isMember: async (eventId) =>
    (await api.get(`/api/events/${eventId}/is-member`)).data,

requestJoin: async (eventId) =>
    (await api.post(`/api/events/${eventId}/request`, null)).data,

approveRequest: async (eventId, userId) =>
    (await api.post(`/api/events/${eventId}/approve/${userId}`)).data,

declineRequest: async (eventId, userId) =>
    (await api.post(`/api/events/${eventId}/decline/${userId}`)).data,

removeMember: async (eventId, userId) =>
    (await api.post(`/api/events/${eventId}/remove/${userId}`)).data,

getPendingRequests: async (eventId) =>
    (await api.get(`/api/events/${eventId}/pending`)).data,

getMemberStatus: async (eventId) =>
    (await api.get(`/api/events/${eventId}/member-status`)).data,


cancel: async (eventId) =>
    (await api.patch(`/api/events/${eventId}/cancel`)).data,

hostEvents: async () =>
    (await api.get("/api/events/my-events")).data,
};