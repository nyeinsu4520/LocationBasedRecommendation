import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { eventsApi } from "../api/eventsApi";
import { paymentApi } from "../api/paymentApi";

export default function HostDashboard({ open, onClose }) {
  const [tab, setTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingMap, setPendingMap] = useState({});
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [err, setErr] = useState("");
  const [cancelDialog, setCancelDialog] = useState({ open: false, eventId: null });
  const [cancelReason, setCancelReason] = useState("");
  const [cancelErr, setCancelErr] = useState("");

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

  const openCancelDialog = (eventId) => {
    setCancelDialog({ open: true, eventId });
    setCancelReason("");
    setCancelErr("");
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setCancelErr("Please provide a reason for cancellation.");
      return;
    }
    try {
      await eventsApi.cancel(cancelDialog.eventId, cancelReason);
      // ✅ Update status to CANCEL_REQUESTED — not cancelled yet
      setEvents((prev) => prev.map((e) =>
        e.id === cancelDialog.eventId
          ? { ...e, status: "CANCEL_REQUESTED" }
          : e
      ));
      setCancelDialog({ open: false, eventId: null });
    } catch {
      setCancelErr("Failed to request cancellation.");
    }
  };

  const handleUpgrade = async () => {
    try {
      const { url } = await paymentApi.createCheckoutSession();
      window.location.href = url;
    } catch (err) {
      setErr("Failed to start checkout. Please try again.");
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Host Dashboard</h2>
            <p className="text-xs text-slate-500">{name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setTab("events")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === "events" ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            My Events
          </button>
          <button
            onClick={() => setTab("account")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === "account" ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Account & Premium
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">

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
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate">{event.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{event.locationName}</div>
                          {/* ✅ Show cancel reason if pending */}
                          {event.status === "CANCEL_REQUESTED" && event.cancelReason && (
                            <div className="mt-1 text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1">
                              Reason: {event.cancelReason}
                            </div>
                          )}
                          {/* ✅ Show cancel reason if cancelled */}
                          {event.status === "CANCELLED" && event.cancelReason && (
                            <div className="mt-1 text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1">
                              Cancelled: {event.cancelReason}
                            </div>
                          )}
                        </div>
                        <Link
                          to={`/host/edit-event/${event.id}`}
                          onClick={onClose}
                          className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          Edit
                        </Link>
                        {/* ✅ Updated status badge */}
                        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                          event.status === "ACTIVE" ? "bg-green-100 text-green-700"
                          : event.status === "CANCEL_REQUESTED" ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-600"
                        }`}>
                          {event.status === "CANCEL_REQUESTED" ? "Pending cancellation" : event.status}
                        </span>
                      </div>

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

                      <div className="mt-3 flex gap-2 items-center">
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

                        {/* ✅ Show Cancel only if ACTIVE */}
                        {event.status === "ACTIVE" && (
                          <button
                            onClick={() => openCancelDialog(event.id)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        )}

                        {/* ✅ Show awaiting message if CANCEL_REQUESTED */}
                        {event.status === "CANCEL_REQUESTED" && (
                          <span className="text-xs text-amber-600 font-medium">
                            Awaiting admin
                          </span>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50 p-3 space-y-2">
                        <p className="text-xs font-semibold text-slate-700 mb-2">Pending requests</p>
                        {pending.length === 0 ? (
                          <p className="text-xs text-slate-500">No pending requests</p>
                        ) : (
                          pending.map((req) => (
                            <div key={req.id} className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-slate-200">
                              <div className="text-sm text-slate-700">User #{req.userId}</div>
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

          {tab === "account" && (
            <div className="space-y-5">
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
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Plan</span>
                    <span className={`font-medium ${isPremium ? "text-purple-700" : "text-slate-600"}`}>
                      {isPremium ? "Premium" : "Free"}
                    </span>
                  </div>
                </div>
              </div>

              {isPremium ? (
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⭐</span>
                    <h3 className="text-sm font-semibold text-purple-900">Premium Host</h3>
                  </div>
                  <p className="text-xs text-purple-700 mb-3">
                    You have premium access — up to 50 attendees per event.
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-purple-200 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-purple-800">
                      <span>✅</span> Up to 50 attendees per event
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-800">
                      <span>✅</span> Priority support
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-800">
                      <span>✅</span> £4.99/month — cancel anytime
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🚀</span>
                    <h3 className="text-sm font-semibold text-amber-900">Upgrade to Premium</h3>
                  </div>
                  <p className="text-xs text-amber-700 mb-3">
                    Host bigger events with up to 50 attendees.
                  </p>
                  <div className="bg-white rounded-lg border border-amber-200 overflow-hidden mb-3">
                    <div className="grid grid-cols-3 text-xs font-semibold text-slate-500 px-3 py-2 bg-slate-50 border-b border-amber-100">
                      <span>Feature</span>
                      <span className="text-center">Free</span>
                      <span className="text-center text-purple-700">Premium</span>
                    </div>
                    <div className="grid grid-cols-3 text-xs px-3 py-2 border-b border-slate-100">
                      <span className="text-slate-600">Attendees</span>
                      <span className="text-center text-slate-700">10</span>
                      <span className="text-center font-bold text-purple-700">50</span>
                    </div>
                    <div className="grid grid-cols-3 text-xs px-3 py-2 border-b border-slate-100">
                      <span className="text-slate-600">Events</span>
                      <span className="text-center text-slate-700">Unlimited</span>
                      <span className="text-center font-bold text-purple-700">Unlimited</span>
                    </div>
                    <div className="grid grid-cols-3 text-xs px-3 py-2">
                      <span className="text-slate-600">Price</span>
                      <span className="text-center text-slate-700">Free</span>
                      <span className="text-center font-bold text-purple-700">£4.99/mo</span>
                    </div>
                  </div>
                  {err && (
                    <div className="mb-3 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</div>
                  )}
                  <button
                    onClick={handleUpgrade}
                    className="w-full text-center text-sm px-4 py-2.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 font-medium transition-colors"
                  >
                    Upgrade — £4.99/month
                  </button>
                  <p className="text-xs text-amber-600 mt-2 text-center">
                    Secure payment via Stripe · Cancel anytime
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Cancel dialog */}
      {cancelDialog.open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Request event cancellation</h3>
            <p className="text-sm text-slate-500 mt-1">
              Your request will be sent to the admin for approval.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Venue unavailable, weather conditions..."
              rows={3}
              className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
            />
            {cancelErr && (
              <p className="mt-2 text-xs text-red-600">{cancelErr}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setCancelDialog({ open: false, eventId: null })}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
              >
                Keep event
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 rounded-xl bg-red-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-red-700"
              >
                Send request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}