import {api} from "./client";
export const authApi = {
    register: async (payload) => (await api.post("/api/auth/register", payload)).data,
    login: async(payload) => (await api.post("/api/auth/login", payload)).data,
};