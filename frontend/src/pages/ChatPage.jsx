import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Chat from "../pages/Chat";
import { connectWebSocket, disconnectWebSocket } from "../api/chatService";
import { getMessages } from "../api/client";
import { locationsApi } from "../api/locationsApi";

export default function ChatPage() {
  const { locationId } = useParams();
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const userId = Number(localStorage.getItem("userId"));
  const username = localStorage.getItem("name");

  useEffect(() => {
    if (!joined) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const msgs = await getMessages(locationId);
        setMessages(msgs);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [locationId, joined]);

  useEffect(() => {
    if (!joined) return;

    connectWebSocket(locationId, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => disconnectWebSocket();
  }, [locationId, joined]);

  const handleJoin = async () => {
    try {
      const res = await locationsApi.join(locationId);
      console.log("JOIN SUCCESS:", res);
      setJoined(true);
    } catch (err) {
      console.error("Failed to join chat:", err);
      alert("Failed to join chat.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Location Chat</h1>
            <p className="text-slate-500 text-sm mt-1">
              Talk with other people who joined this place.
            </p>
          </div>

          <Link
            to="/locations"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Back to Locations
          </Link>
        </div>

        {/* Main Card */}
        <div className="mt-6 relative bg-white rounded-2xl shadow p-5 min-h-[650px]">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Chat Room
              </h2>
              <p className="text-sm text-slate-500">
                Location ID: {locationId}
              </p>
            </div>

            <div
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                joined
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {joined ? "Joined" : "Not joined"}
            </div>
          </div>

          <Chat
            locationId={locationId}
            userId={userId}
            username={username}
            messages={messages}
            canSend={joined}
            loading={loading}
          />

          {!joined && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-2xl">
              <div className="bg-white border border-slate-200 shadow rounded-2xl px-8 py-8 text-center max-w-md">
                <h3 className="text-xl font-semibold text-slate-900">
                  You are viewing this chat
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Join this location first before sending messages.
                </p>

                <button
                  onClick={handleJoin}
                  className="mt-5 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-800"
                >
                  Confirm Join Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}