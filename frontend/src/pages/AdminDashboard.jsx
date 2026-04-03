import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../api/adminApi";

export default function AdminDashboard() {
  const [tab, setTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [cancelRequests, setCancelRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setErr("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setErr("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setErr("Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  const loadCancelRequests = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCancelRequests();
      setCancelRequests(Array.isArray(data) ? data : []);
    } catch {
      setErr("Failed to load cancel requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "requests") loadRequests();
    else if (tab === "cancel-requests") loadCancelRequests();
    else if (tab === "events") loadEvents();
    else loadUsers();
  }, [tab]);

  const approve = async (id) => {
    try {
      await adminApi.approveRequest(id);
      loadRequests();
    } catch (e) {
      setErr(e.response?.data || "Failed to approve.");
    }
  };

  const reject = async (id) => {
    try {
      await adminApi.rejectRequest(id);
      loadRequests();
    } catch (e) {
      setErr(e.response?.data || "Failed to reject.");
    }
  };

  const ban = async (id) => {
    try {
      await adminApi.banUser(id);
      loadUsers();
    } catch (e) {
      setErr(e.response?.data || "Failed to ban user.");
    }
  };

  const unban = async (id) => {
    try {
      await adminApi.unbanUser(id);
      loadUsers();
    } catch (e) {
      setErr(e.response?.data || "Failed to unban user.");
    }
  };

  const demote = async (id) => {
    try {
      await adminApi.demoteUser(id);
      loadUsers();
    } catch (e) {
      setErr(e.response?.data || "Failed to demote user.");
    }
  };

  const statusColor = (status) => {
    if (status === "PENDING") return "bg-amber-50 text-amber-700";
    if (status === "APPROVED") return "bg-green-50 text-green-700";
    if (status === "REJECTED") return "bg-red-50 text-red-600";
    return "bg-slate-100 text-slate-600";
  };

  const roleColor = (role) => {
    if (role === "ADMIN") return "bg-purple-50 text-purple-700";
    if (role === "HOST_PREMIUM") return "bg-amber-50 text-amber-700";
    if (role === "HOST") return "bg-blue-50 text-blue-700";
    return "bg-slate-100 text-slate-600";
  };

  const eventStatusColor = (status) => {
    if (status === "ACTIVE") return "bg-green-50 text-green-700";
    if (status === "CANCEL_REQUESTED") return "bg-amber-50 text-amber-700";
    if (status === "CANCELLED") return "bg-red-50 text-red-600";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-6">

        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Admin dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Manage host requests, users and events.</p>
          </div>
          <Link to="/locations" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100">
            Back to app
          </Link>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setTab("requests")}
            className={`px-4 py-2 rounded-xl text-sm font-medium border ${
              tab === "requests" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Host requests
            {requests.filter((r) => r.status === "PENDING").length > 0 && (
              <span className="ml-2 bg-amber-400 text-amber-900 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {requests.filter((r) => r.status === "PENDING").length}
              </span>
            )}
            {requests.length > 0 && (
              <span className="ml-2 bg-red-400 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab("cancel-requests")}
            className={`px-4 py-2 rounded-xl text-sm font-medium border ${
              tab === "cancel-requests" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Cancel requests
            {cancelRequests.length > 0 && (
              <span className="ml-2 bg-red-400 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {cancelRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab("users")}
            className={`px-4 py-2 rounded-xl text-sm font-medium border ${
              tab === "users" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Users
            {users.length > 0 && (
              <span className="ml-2 bg-red-400 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {users.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab("events")}
            className={`px-4 py-2 rounded-xl text-sm font-medium border ${
              tab === "events" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Events
            {events.length > 0 && (
              <span className="ml-2 bg-red-400 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {events.length}
              </span>
            )}
          </button>
        </div>

        {err && (
          <div className="mt-4 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">{err}</div>
        )}

        {loading && (
          <div className="mt-6 text-sm text-slate-500">Loading...</div>
        )}

        {/* ✅ Host requests tab */}
        {tab === "requests" && !loading && (
          <div className="mt-4 space-y-3">
            {requests.length === 0 && (
              <div className="text-sm text-slate-500 py-8 text-center">No host requests yet.</div>
            )}
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-medium text-slate-900">{req.user?.name || "Unknown user"}</div>
                      <span className="text-xs text-slate-400">{req.user?.email}</span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                    {req.reason && (
                      <div className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                        {req.reason}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-slate-400">
                      Submitted {new Date(req.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </div>
                  </div>
                  {req.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button onClick={() => approve(req.id)} className="rounded-xl bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700">
                        Approve
                      </button>
                      <button onClick={() => reject(req.id)} className="rounded-xl bg-red-50 text-red-600 border border-red-200 px-4 py-2 text-sm font-medium hover:bg-red-100">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "cancel-requests" && !loading && (
          <div className="mt-4 space-y-3">
            {cancelRequests.length === 0 && (
              <div className="text-sm text-slate-500 py-8 text-center">
                No cancellation requests.
              </div>
            )}
            {cancelRequests.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-medium text-slate-900">{event.title}</div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                        Pending cancellation
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5">{event.locationName}</div>
                    {event.cancelReason && (
                      <div className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                        Reason: {event.cancelReason}
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">
                      {event.attendeeCount} attendee{event.attendeeCount !== 1 ? "s" : ""} will be affected
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await adminApi.approveCancelRequest(event.id);
                          loadCancelRequests();
                        } catch {
                          setErr("Failed to approve cancellation.");
                        }
                      }}
                      className="rounded-xl bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700"
                    >
                      Approve cancel
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await adminApi.rejectCancelRequest(event.id);
                          loadCancelRequests();
                        } catch {
                          setErr("Failed to reject cancellation.");
                        }
                      }}
                      className="rounded-xl bg-green-50 text-green-700 border border-green-200 px-4 py-2 text-sm font-medium hover:bg-green-100"
                    >
                      Keep event
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ Users tab */}
        {tab === "users" && !loading && (
          <div className="mt-4 space-y-3">
            {users.length === 0 && (
              <div className="text-sm text-slate-500 py-8 text-center">No users found.</div>
            )}
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-medium text-slate-900">{user.name}</div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleColor(user.role)}`}>
                      {user.role}
                    </span>
                    {user.status === "BANNED" && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-600">
                        BANNED
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 mt-0.5">{user.email}</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(user.role === "HOST" || user.role === "HOST_PREMIUM") && (
                    <button onClick={() => demote(user.id)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      Demote to user
                    </button>
                  )}
                  {user.status === "BANNED" ? (
                    <button onClick={() => unban(user.id)} className="rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100">
                      Unban
                    </button>
                  ) : user.role !== "ADMIN" ? (
                    <button onClick={() => ban(user.id)} className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100">
                      Ban
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "events" && !loading && (
          <div className="mt-4 space-y-3">
            {events.length === 0 && (
              <div className="text-sm text-slate-500 py-8 text-center">No events found.</div>
            )}
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-medium text-slate-900">{event.title}</div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${eventStatusColor(event.status)}`}>
                        {event.status === "CANCEL_REQUESTED" ? "Pending cancellation" : event.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5">{event.locationName}</div>
                    {event.cancelReason && (
                      <div className="mt-1 text-xs text-slate-500 bg-slate-50 rounded-lg px-2 py-1">
                        {event.status === "CANCELLED" ? "Cancelled: " : "Reason: "}{event.cancelReason}
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">
                      {event.attendeeCount}/{event.maxAttendees} attendees
                      {event.eventDate && ` · ${new Date(event.eventDate).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric"
                      })}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* ✅ Approve/reject cancel if pending */}
                    {event.status === "CANCEL_REQUESTED" && (
                      <>
                        <button
                          onClick={async () => {
                            try {
                              await adminApi.approveCancelRequest(event.id);
                              loadEvents();
                            } catch {
                              setErr("Failed to approve cancellation.");
                            }
                          }}
                          className="rounded-xl bg-red-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-red-700"
                        >
                          Approve cancel
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await adminApi.rejectCancelRequest(event.id);
                              loadEvents();
                            } catch {
                              setErr("Failed to reject cancellation.");
                            }
                          }}
                          className="rounded-xl bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 text-xs font-medium hover:bg-green-100"
                        >
                          Keep event
                        </button>
                      </>
                    )}
                    {event.status === "ACTIVE" && (
                    <span className="text-xs text-slate-400 italic">
                        Waiting for host request
                    </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}