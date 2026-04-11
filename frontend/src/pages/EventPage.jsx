import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { eventsApi } from "../api/eventsApi";
import { geocodePlace } from "../api/geocodeApi";
import { feedbackApi } from "../api/feedbackApi";
import FeedbackList from "./FeedbackList";

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


function FeedbackForm({ eventId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return setErr("Please select a star rating.");
    try {
      setLoading(true);
      await feedbackApi.submit(eventId, rating, comment);
      setDone(true);
      onSubmitted();
    } catch (e) {
      setErr(e.response?.data || "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="mt-3 text-sm text-green-600 font-medium">
       Thank you for your feedback!
    </div>
  );

  return (
    <div className="mt-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
      <p className="text-sm font-medium text-slate-700 mb-2">Rate this event</p>

      {/* Stars */}
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            className="text-2xl transition-transform hover:scale-110"
          >
            <span className={star <= (hovered || rating) ? "text-amber-400" : "text-slate-200"}>
              ★
            </span>
          </button>
        ))}
        {(hovered || rating) > 0 && (
          <span className="text-xs text-amber-600 font-medium self-center ml-1">
            {["", "Poor", "Fair", "Good", "Very good", "Excellent"][hovered || rating]}
          </span>
        )}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)..."
        rows={2}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
      />

      {err && <p className="text-xs text-red-600 mt-1">{err}</p>}

      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:bg-slate-300"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const userId = parseInt(localStorage.getItem("userId"));
  const isHost = role === "HOST" || role === "HOST_PREMIUM";

  const [tab, setTab] = useState("nearby");
  const [events, setEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [userLat, setUserLat] = useState(51.4816);
  const [userLng, setUserLng] = useState(-3.1791);
  const [radiusKm, setRadiusKm] = useState(5);
  const [query, setQuery] = useState("");
  const [geoResults, setGeoResults] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [locationLabel, setLocationLabel] = useState("");
  const [joinedEventIds, setJoinedEventIds] = useState(new Set());
  const [submittedFeedback, setSubmittedFeedback] = useState(new Set());

  const loadJoined = async () => {
    try {
      const data = await eventsApi.joined();
      const ids = new Set(data.map((m) => m.event?.id).filter(Boolean));
      setJoinedEventIds(ids);
      const eventDetails = await Promise.all(
        [...ids].map(id => eventsApi.getById(id).catch(() => null))
      );
      setJoinedEvents(eventDetails.filter(e => e && e.status !== "CANCELLED" && e.status !== "CANCEL_REQUESTED"));
    } catch {}
  };

  const loadEvents = async (lat, lng, radius) => {
    try {
      setLoading(true);
      setErr("");
      const data = await eventsApi.nearby(lat, lng, radius);
      const visible = Array.isArray(data)
        ? data.filter(e => e.status !== "CANCELLED" && e.status !== "CANCEL_REQUESTED")
        : [];
      setEvents(visible);
    } catch {
      setErr("Failed to load events. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJoined();
  }, []);

  const onSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    try {
      setErr("");
      setGeoLoading(true);
      const results = await geocodePlace(q);
      setGeoResults(results);
      if (!results || results.length === 0) setErr("No results found. Try a different search.");
    } catch {
      setErr("Location search failed. Try again.");
    } finally {
      setGeoLoading(false);
    }
  };

  const chooseResult = (r) => {
    setUserLat(r.lat);
    setUserLng(r.lng);
    setLocationLabel(r.displayName);
    setGeoResults([]);
    setQuery(r.displayName);
    loadEvents(r.lat, r.lng, radiusKm);
  };

  const useMyLocation = () => {
    setQuery("");
    setLocationLabel("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLat(latitude);
        setUserLng(longitude);
        loadEvents(latitude, longitude, radiusKm);
      },
      () => setErr("Could not get your location.")
    );
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

  // ✅ Completed events user attended — for feedback tab
  const completedEvents = joinedEvents.filter(e => e.status === "COMPLETED");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Events</h1>
            <p className="text-slate-500 text-sm mt-1">Discover and join events near you.</p>
          </div>
        </div>

        {/* ✅ Three tabs */}
        <div className="mt-5 flex gap-2 flex-wrap">
          <button
            onClick={() => setTab("nearby")}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              tab === "nearby"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Nearby Events
          </button>
          <button
            onClick={() => setTab("joined")}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              tab === "joined"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Joined Events
            {joinedEvents.length > 0 && (
              <span className="ml-2 bg-slate-200 text-slate-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {joinedEvents.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("feedback")}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              tab === "feedback"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Feedback
            {completedEvents.filter(e => !submittedFeedback.has(e.id)).length > 0 && (
              <span className="ml-2 bg-amber-400 text-amber-900 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {completedEvents.filter(e => !submittedFeedback.has(e.id)).length}
              </span>
            )}
          </button>
        </div>

        {err && (
          <div className="mt-4 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">{err}</div>
        )}

        {/* ✅ Nearby Events tab */}
        {tab === "nearby" && (
          <>
            <div className="mt-4 bg-white rounded-2xl shadow p-4">
              <form onSubmit={onSearch} className="flex gap-2">
                <input
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="Search city, area or address..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className="rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-slate-800">
                  {geoLoading ? "Searching..." : "Search"}
                </button>
                <button type="button" onClick={useMyLocation} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Use GPS
                </button>
              </form>

              {geoResults.length > 0 && (
                <div className="mt-2 rounded-xl border border-slate-200 overflow-hidden">
                  {geoResults.map((r, idx) => (
                    <button key={idx} type="button" onClick={() => chooseResult(r)} className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0">
                      <div className="text-sm font-medium text-slate-900">{r.displayName}</div>
                      <div className="text-xs text-slate-500">{r.lat.toFixed(5)}, {r.lng.toFixed(5)}</div>
                    </button>
                  ))}
                </div>
              )}

              {locationLabel && (
                <div className="mt-2 text-xs text-green-600 font-medium">
                  Showing events near: {locationLabel}
                </div>
              )}
            </div>

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

            <div className="mt-4 space-y-4">
              {events.map((event) => {
                const spotsLeft = event.spotsLeft;
                const isFull = spotsLeft <= 0;
                const isJoined = joinedEventIds.has(event.id);
                const distanceKm = getDistanceKm(userLat, userLng, event.latitude, event.longitude);

                return (
                  <div key={event.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 text-base">{event.title}</div>
                        <div className="text-sm text-slate-500 mt-1">
                          {event.locationName}{event.address && ` · ${event.address}`}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {event.eventDate && (
                            <span className="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                              {new Date(event.eventDate).toLocaleDateString("en-GB", {
                                weekday: "short", day: "numeric", month: "short",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                          )}
                          <span className="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                            {distanceKm.toFixed(2)} km away
                          </span>
                          {event.status === "COMPLETED" ? (
                            <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-lg font-medium bg-blue-50 text-blue-700">
                              Completed
                            </span>
                          ) : isFull ? (
                            <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-lg font-medium bg-red-50 text-red-600">
                              Full
                            </span>
                          ) : (
                            <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-lg font-medium ${
                              spotsLeft <= 3 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"
                            }`}>
                              {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left
                            </span>
                          )}
                          <span className="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                            {event.attendeeCount} / {event.maxAttendees} joined
                          </span>
                        </div>
                        {event.description && (
                          <div className="mt-2 text-sm text-slate-600 line-clamp-2">{event.description}</div>
                        )}
                      </div>
                      {event.status === "COMPLETED" ? (
                        <span className="text-xs text-blue-600 font-medium">Completed</span>
                      ) : isJoined ? (
                        <button
                          onClick={() => navigate(`/events/${event.id}/chat`)}
                          className="rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap bg-green-600 text-white hover:bg-green-700"
                        >
                          Open Chat
                        </button>
                      ) : isFull ? (
                        <button disabled className="rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap bg-slate-100 text-slate-400 cursor-not-allowed">
                          Full
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/events/${event.id}/chat`)}
                          className="rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap bg-slate-900 text-white hover:bg-slate-800"
                        >
                          Join event
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {!loading && events.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No events found nearby.
                  {isHost && (
                    <div className="mt-3">
                      <Link to="/host/create-event" className="text-slate-900 font-medium hover:underline">
                        Create the first one
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* ✅ Joined Events tab */}
        {tab === "joined" && (
          <div className="mt-4 space-y-4">
            {joinedEvents.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-sm">
                You have not joined any events yet.
              </div>
            )}
            {joinedEvents.map((event) => {
              const isCompleted = event.status === "COMPLETED";
              return (
                <div key={event.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-semibold text-slate-900 text-base">{event.title}</div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          isCompleted ? "bg-blue-50 text-blue-700"
                          : "bg-green-50 text-green-700"
                        }`}>
                          {isCompleted ? "Completed" : "Active"}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 mt-1">{event.locationName}</div>
                      {event.eventDate && (
                        <div className="text-xs text-slate-400 mt-1">
                          {new Date(event.eventDate).toLocaleDateString("en-GB", {
                            weekday: "short", day: "numeric", month: "short",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                    {!isCompleted && (
                      <button
                        onClick={() => navigate(`/events/${event.id}/chat`)}
                        className="rounded-xl px-4 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                      >
                        Open Chat
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ✅ Feedback tab */}
        {tab === "feedback" && (
          <div className="mt-4 space-y-4">
            {completedEvents.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-sm">
                No completed events to review yet.
              </div>
            )}
            {completedEvents.map((event) => {
              const alreadySubmitted = submittedFeedback.has(event.id);
              return (
                <div key={event.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-semibold text-slate-900">{event.title}</div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                      Completed
                    </span>
                  </div>
                  <div className="text-sm text-slate-500">{event.locationName}</div>
                  {event.eventDate && (
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(event.eventDate).toLocaleDateString("en-GB", {
                        weekday: "short", day: "numeric", month: "short",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </div>
                  )}

                  {/* ✅ Show feedback form if not submitted yet */}
                  {!alreadySubmitted ? (
                    <FeedbackForm
                      eventId={event.id}
                      onSubmitted={() =>
                        setSubmittedFeedback(prev => new Set([...prev, event.id]))
                      }
                    />
                  ) : (
                    <p className="mt-3 text-sm text-green-600 font-medium">
                      ✅ Feedback submitted
                    </p>
                  )}

                  {/* ✅ Show all reviews for this event */}
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">All reviews</p>
                    <FeedbackList eventId={event.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}