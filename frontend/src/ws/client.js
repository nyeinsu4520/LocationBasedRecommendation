// src/ws/client.js
import { Client } from "@stomp/stompjs";

const token = localStorage.getItem("token");

client = new Client({
  brokerURL: "ws://localhost:8080/ws",
  connectHeaders: {
    Authorization: `Bearer ${token}`
  },
  reconnectDelay: 5000,
  debug: (str) => console.log("[STOMP]", str)
});

client.onConnect = () => {
  console.log("Connected to WebSocket");
  client.subscribe("/topic/messages", (message) => {
    console.log("Received message:", message.body);
  });
};



client.activate();