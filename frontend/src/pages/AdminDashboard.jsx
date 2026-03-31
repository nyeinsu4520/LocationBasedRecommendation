import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../api/adminApi";

export default function AdminDashboard() {
  const [tab, setTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
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

  useEffect(() => {
    if (tab === "requests") loadRequests();
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
    if (role === "HOST") return "bg-blue-50 text-blue-700";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Admin dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Manage host requests and users.</p>
          </div>
          <Link
            to="/locations"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Back to app
          </Link>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setTab("requests")}
            className={`px-4 py-2 rounded-xl text-sm font-medium border ${
              tab === "requests"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Host requests
            {requests.filter((r) => r.status === "PENDING").length > 0 && (
              <span className="ml-2 bg-amber-400 text-amber-900 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {requests.filter((r) => r.status === "PENDING").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("users")}
            className={`px-4 py-2 rounded-xl text-sm font-medium border ${
              tab === "users"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Users
          </button>
        </div>

        {err && (
          <div className="mt-4 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">{err}</div>
        )}

        {loading && (
          <div className="mt-6 text-sm text-slate-500">Loading...</div>
        )}

        {/* Host requests tab */}
        {tab === "requests" && !loading && (
          <div className="mt-4 space-y-3">
            {requests.length === 0 && (
              <div className="text-sm text-slate-500 py-8 text-center">
                No host requests yet.
              </div>
            )}
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-medium text-slate-900">
                        {req.user?.name || "Unknown user"}
                      </div>
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

                  {/* Actions — only show for pending */}
                  {req.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approve(req.id)}
                        className="rounded-xl bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => reject(req.id)}
                        className="rounded-xl bg-red-50 text-red-600 border border-red-200 px-4 py-2 text-sm font-medium hover:bg-red-100"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users tab */}
        {tab === "users" && !loading && (
          <div className="mt-4 space-y-3">
            {users.length === 0 && (
              <div className="text-sm text-slate-500 py-8 text-center">No users found.</div>
            )}
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-3 flex-wrap"
              >
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
                  {user.role === "HOST" && (
                    <button
                      onClick={() => demote(user.id)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Demote to user
                    </button>
                  )}
                  {user.status === "BANNED" ? (
                    <button
                      onClick={() => unban(user.id)}
                      className="rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                    >
                      Unban
                    </button>
                  ) : user.role !== "ADMIN" ? (
                    <button
                      onClick={() => ban(user.id)}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                    >
                      Ban
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}