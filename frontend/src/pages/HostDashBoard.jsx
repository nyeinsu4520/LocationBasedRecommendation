import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { eventsApi } from "../api/eventsApi";

export default function HostDashboard({ open, onClose }) {
  const [tab, setTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingMap, setPendingMap] = useState({});
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [err, setErr] = useState("");

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
  const isPremium = role === "HOST_PREMIUM";

  useEffect(() => {
    if (!open) return;
    loadEvents();
  }, [open]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.hostEvents();
      setEvents(Array.isArray(data) ? data : []);
      // Load pending requests for each event
      const pending = {};
      for (const event of data) {
        try {
          const requests = await eventsApi.getPendingRequests(event.id);
          pending[event.id] = requests;
        } catch {}
      }
      setPendingMap(pending);
    } catch {
      setErr("Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId, userId) => {
    try {
      await eventsApi.approveRequest(eventId, userId);
      setPendingMap((prev) => ({
        ...prev,
        [eventId]: prev[eventId].filter((r) => r.userId !== userId),
      }));
    } catch {}
  };

  const handleDecline = async (eventId, userId) => {
    try {
      await eventsApi.declineRequest(eventId, userId);
      setPendingMap((prev) => ({
        ...prev,
        [eventId]: prev[eventId].filter((r) => r.userId !== userId),
      }));
    } catch {}
  };

  const handleCancel = async (eventId) => {
    if (!window.confirm("Cancel this event?")) return;
    try {
      await eventsApi.cancel(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch {
      setErr("Failed to cancel event.");
    }
  };

  if (!open) return null;

  return (
    <>
      {/* ✅ Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* ✅ Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Host Dashboard</h2>
            <p className="text-xs text-slate-500">{name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setTab("events")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === "events"
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            My Events
          </button>
          <button
            onClick={() => setTab("account")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === "account"
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Account & Premium
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ✅ My Events tab */}
          {tab === "events" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{events.length} event(s)</p>
                <Link
                  to="/host/create-event"
                  onClick={onClose}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                >
                  + New event
                </Link>
              </div>

              {loading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-slate-200 p-4 animate-pulse">
                      <div className="h-3 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && events.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-sm">No events yet.</p>
                  <Link
                    to="/host/create-event"
                    onClick={onClose}
                    className="mt-3 inline-block text-sm text-slate-900 font-medium hover:underline"
                  >
                    Create your first event
                  </Link>
                </div>
              )}

              {events.map((event) => {
                const pending = pendingMap[event.id] || [];
                const isExpanded = expandedEvent === event.id;

                return (
                  <div key={event.id} className="rounded-xl border border-slate-200 overflow-hidden">
                    {/* Event header */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate">{event.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{event.locationName}</div>
                        </div>
                        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                          event.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {event.status}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="mt-3 flex gap-3">
                        <div className="text-center">
                          <div className="text-base font-bold text-slate-900">{event.attendeeCount}</div>
                          <div className="text-xs text-slate-500">Joined</div>
                        </div>
                        <div className="text-center">
                          <div className="text-base font-bold text-slate-900">{event.spotsLeft}</div>
                          <div className="text-xs text-slate-500">Spots left</div>
                        </div>
                        <div className="text-center">
                          <div className="text-base font-bold text-amber-600">{pending.length}</div>
                          <div className="text-xs text-slate-500">Pending</div>
                        </div>
                        <div className="text-center">
                          <div className="text-base font-bold text-slate-900">{event.maxAttendees}</div>
                          <div className="text-xs text-slate-500">Max</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex gap-2">
                        <Link
                          to={`/events/${event.id}/chat`}
                          onClick={onClose}
                          className="flex-1 text-center text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                        >
                          Open Chat
                        </Link>
                        <button
                          onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          {isExpanded ? "Hide" : "Requests"}
                          {pending.length > 0 && (
                            <span className="ml-1 bg-amber-500 text-white rounded-full px-1.5 text-xs">
                              {pending.length}
                            </span>
                          )}
                        </button>
                        {event.status === "ACTIVE" && (
                          <button
                            onClick={() => handleCancel(event.id)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ✅ Pending requests */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50 p-3 space-y-2">
                        <p className="text-xs font-semibold text-slate-700 mb-2">
                          Pending requests
                        </p>
                        {pending.length === 0 ? (
                          <p className="text-xs text-slate-500">No pending requests</p>
                        ) : (
                          pending.map((req) => (
                            <div key={req.id} className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-slate-200">
                              <div className="text-sm text-slate-700">
                                User #{req.userId}
                              </div>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleApprove(event.id, req.userId)}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleDecline(event.id, req.userId)}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
                                >
                                  Decline
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ✅ Account & Premium tab */}
          {tab === "account" && (
            <div className="space-y-5">

              {/* Account info */}
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Account</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Name</span>
                    <span className="text-slate-900 font-medium">{name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Role</span>
                    <span className="text-slate-900 font-medium capitalize">
                      {role?.toLowerCase().replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Premium section */}
              {isPremium ? (
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-purple-900">Premium Host</h3>
                  </div>
                  <p className="text-xs text-purple-700">
                    You have premium access — up to 50 attendees per event.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-amber-900">Upgrade to Premium</h3>
                  </div>
                  <p className="text-xs text-amber-700 mb-3">
                    Get up to 50 attendees per event instead of 10.
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-amber-200 mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Free plan</span>
                      <span className="font-medium">10 attendees</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Premium plan</span>
                      <span className="font-bold text-purple-700">50 attendees</span>
                    </div>
                  </div>
                  <Link
                    to="/request-host"
                    onClick={onClose}
                    className="block w-full text-center text-sm px-4 py-2.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 font-medium"
                  >
                    Request Premium Upgrade
                  </Link>
                  <p className="text-xs text-amber-600 mt-2 text-center">
                    Admin reviews and approves within 24 hours
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}