import {api} from "./client";
export const authApi = {


    register: async (data) => {
    const res = await api.post("/api/auth/register", data);
    return res.data; 
    },
    login: async(payload) => (await api.post("/api/auth/login", payload)).data,
};