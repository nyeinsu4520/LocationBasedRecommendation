import axios from "axios";


export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("TOKEN:", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("AUTH HEADER:", config.headers.Authorization);
  return config;
});

export async function getMessages(locationId) {
  try {
    const response = await api.get(`/api/chat/${locationId}`); 
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}
