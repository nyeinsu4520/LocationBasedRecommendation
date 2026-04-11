import { api } from "./client";

export const eventsApi = {
  // ✅ Nearby events
  nearby: async (lat, lng, radiusKm) =>
    (await api.get("/api/events/nearby", {
      params: { lat, lng, radiusKm },
    })).data,

  // ✅ Join an event
  join: async (eventId) =>
    (await api.post(`/api/events/${eventId}/join`, null)).data,

  // ✅ Leave an event
  leave: async (eventId) =>
    (await api.post(`/api/events/${eventId}/leave`, null)).data,

  // ✅ Events the logged-in user has joined
  joined: async () =>
    (await api.get("/api/events/joined")).data,

  // ✅ Who is attending an event
  presence: async (eventId) =>
    (await api.get(`/api/events/${eventId}/attendees`)).data,

  // ✅ Create an event
  create: async (event) =>
    (await api.post("/api/events", event)).data,

  // ✅ Host's own events — removed duplicate myEvents
  hostEvents: async () =>
    (await api.get("/api/events/my-events")).data,

  // ✅ Check membership
  isMember: async (eventId) =>
    (await api.get(`/api/events/${eventId}/is-member`)).data,

  // ✅ Request to join
  requestJoin: async (eventId) =>
    (await api.post(`/api/events/${eventId}/request`, null)).data,

  // ✅ Approve request
  approveRequest: async (eventId, userId) =>
    (await api.post(`/api/events/${eventId}/approve/${userId}`)).data,

  // ✅ Decline request
  declineRequest: async (eventId, userId) =>
    (await api.post(`/api/events/${eventId}/decline/${userId}`)).data,

  // ✅ Remove member
  removeMember: async (eventId, userId) =>
    (await api.post(`/api/events/${eventId}/remove/${userId}`)).data,

  // ✅ Get pending requests
  getPendingRequests: async (eventId) =>
    (await api.get(`/api/events/${eventId}/pending`)).data,

  // ✅ Get member status
  getMemberStatus: async (eventId) =>
    (await api.get(`/api/events/${eventId}/member-status`)).data,

  // ✅ Cancel event
  cancel: async (eventId, reason) =>
    (await api.post(`/api/events/${eventId}/cancel`, { reason })).data,

  // ✅ Get single event by id
  getById: async (eventId) =>
    (await api.get(`/api/events/${eventId}`)).data,

  // ✅ Update event
  update: async (eventId, data) =>
    (await api.put(`/api/events/${eventId}`, data)).data,

  complete: async (eventId) => 
  (await api.post(`/api/events/${eventId}/complete`)).data,

};