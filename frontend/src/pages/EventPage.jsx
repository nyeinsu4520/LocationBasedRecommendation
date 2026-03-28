import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { eventsApi } from "../api/eventsApi";

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function EventsPage() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isHost = role === "HOST" || role === "HOST_PREMIUM";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [userLat, setUserLat] = useState(51.4816);
  const [userLng, setUserLng] = useState(-3.1791);
  const [radiusKm, setRadiusKm] = useState(5);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  const loadEvents = async (lat, lng, radius) => {
    try {
      setLoading(true);
      setErr("");
      const data = await eventsApi.nearby(lat, lng, radius);
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setErr("Failed to load events. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLat(latitude);
        setUserLng(longitude);
        loadEvents(latitude, longitude, radiusKm);
      },
      () => loadEvents(userLat, userLng, radiusKm),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    loadEvents(userLat, userLng, radiusKm);
  }, [radiusKm]);

  const joinEvent = async (eventId) => {
    try {
      await eventsApi.join(eventId);
      navigate(`/events/${eventId}/chat`);
    } catch (error) {
      setErr(error.response?.data || "Failed to join event.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto p-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Nearby Events</h1>
            <p className="text-slate-500 text-sm mt-1">Host-created events near you.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {isHost && (
              <Link
                to="/host/create-event"
                className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
              >
                Create event
              </Link>
            )}
            <button
              onClick={logout}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="mt-6 flex gap-2">
          <Link
            to="/locations"
            className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            Map & Recommendations
          </Link>
          <span className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-900 text-white">
            Events
          </span>
        </div>

        {err && (
          <div className="mt-4 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">{err}</div>
        )}

        {/* Radius filter */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm text-slate-600">Radius</span>
          {[1, 2, 5, 10].map((km) => (
            <button
              key={km}
              onClick={() => setRadiusKm(km)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium border ${
                radiusKm === km
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {km} km
            </button>
          ))}
        </div>

        <div className="mt-4 text-sm text-slate-500">
          {loading ? "Loading events..." : `${events.length} event(s) found`}
        </div>

        {/* Event cards */}
        <div className="mt-4 space-y-4">
          {events.map((event) => {
            // ✅ spotsLeft comes directly from DTO — no extra API call
            const spotsLeft = event.spotsLeft;
            const isFull = spotsLeft <= 0;
            const distanceKm = getDistanceKm(
              userLat, userLng,
              event.latitude, event.longitude
            );

            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-slate-200 p-5"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-base">
                      {event.title}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {event.locationName}
                      {event.address && ` · ${event.address}`}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {event.eventDate && (
                        <span className="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                          {new Date(event.eventDate).toLocaleDateString("en-GB", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}

                      <span className="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                        {distanceKm.toFixed(2)} km away
                      </span>

                      {/* ✅ Spots left from DTO directly */}
                      <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-lg font-medium ${
                        isFull
                          ? "bg-red-50 text-red-600"
                          : spotsLeft <= 3
                          ? "bg-amber-50 text-amber-700"
                          : "bg-green-50 text-green-700"
                      }`}>
                        {isFull
                          ? "Full"
                          : `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`}
                      </span>

                      {/* ✅ Attendee count from DTO */}
                      <span className="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                        {event.attendeeCount} / {event.maxAttendees} joined
                      </span>
                    </div>

                    {event.description && (
                      <div className="mt-2 text-sm text-slate-600 line-clamp-2">
                        {event.description}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => joinEvent(event.id)}
                    disabled={isFull}
                    className={`rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap ${
                      isFull
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {isFull ? "Full" : "Join event"}
                  </button>
                </div>
              </div>
            );
          })}

          {!loading && events.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              No events found nearby.
              {isHost && (
                <div className="mt-3">
                  <Link
                    to="/host/create-event"
                    className="text-slate-900 font-medium hover:underline"
                  >
                    Create the first one
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}