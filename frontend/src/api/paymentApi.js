import { api } from "./client";

export const paymentApi = {
    createCheckoutSession: async () => {
        const res = await api.post("/api/payments/create-checkout-session");
        return res.data;
    },
    getStatus: async () => {
        const res = await api.get("/api/payments/status");
        return res.data;
    }
};