import {api} from "./client";
export const feedbackApi = {
    submit:async (eventId, rating, comment) => (await api.post(`/api/feedback/${eventId}`, {rating, comment})).data,

    getByEvent:async (eventId) => 
    (await api.get(`/api/feedback/${eventId}`)).data,

    getAverage:async (eventId) => (await api.get(`/api/feedback/${eventId}/average`)).data,
}