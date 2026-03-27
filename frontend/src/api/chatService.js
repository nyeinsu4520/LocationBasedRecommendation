import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let client = null;

export const connectWebSocket = (locationId, onMessageReceived) => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No JWT token found! Cannot connect WebSocket.");
    return;
  }

  if (client) {
    client.deactivate();
  }

  client = new Client({
    webSocketFactory: () => new SockJS(`http://localhost:8080/ws?token=${token}`),
    reconnectDelay: 5000,
    debug: (str) => console.log("[STOMP]", str),
  });

  client.onConnect = () => {
    console.log("Connected to WebSocket");

    client.subscribe(`/topic/locations/${locationId}`, (message) => {
      console.log("WebSocket message:", message.body);
      if (onMessageReceived) {
        onMessageReceived(JSON.parse(message.body));
      }
    });
  };

  client.onStompError = (frame) => {
    console.error("STOMP error:", frame.headers["message"], frame.body);
  };

  client.activate();
};

export const sendMessage = (locationId, message) => {
  if (!client || !client.connected) {
    console.error("WebSocket not connected!");
    return;
  }

  client.publish({
    destination: `/app/locations/${locationId}/chat`,
    body: JSON.stringify(message),
  });
};

export const disconnectWebSocket = () => {
  if (client) {
    client.deactivate();
    client = null;
    console.log("WebSocket disconnected");
  }
};