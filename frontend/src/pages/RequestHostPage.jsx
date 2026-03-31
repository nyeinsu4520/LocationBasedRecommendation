import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { hostRequestApi } from "../api/hostRequestApi";

export default function RequestHostPage() {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);

  const role = localStorage.getItem("role");

  useEffect(() => {
    const loadMyRequests = async () => {
      try {
        const requests = await hostRequestApi.myRequests();
        if (requests.length > 0) {
          setExistingRequest(requests[requests.length - 1]);
        }
      } catch {
        // no requests yet
      }
    };
    loadMyRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return setErr("Please explain why you want to be a host.");
    try {
      setLoading(true);
      setErr("");
      await hostRequestApi.submit(reason);
      setSuccess(true);
    } catch (error) {
      setErr(error.response?.data || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    if (status === "PENDING") return "bg-amber-50 text-amber-700";
    if (status === "APPROVED") return "bg-green-50 text-green-700";
    if (status === "REJECTED") return "bg-red-50 text-red-600";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-xl mx-auto p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Become a host</h1>
            <p className="text-slate-500 text-sm mt-1">
              Request host access to create events.
            </p>
          </div>
          <Link
            to="/locations"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Back
          </Link>
        </div>

        {/* Already a host */}
        {role === "HOST" || role === "HOST_PREMIUM" ? (
          <div className="mt-6 bg-green-50 rounded-2xl p-5">
            <div className="font-medium text-green-800">You are already a host!</div>
            <div className="text-sm text-green-600 mt-1">
              You can create events from the locations page.
            </div>
            <Link
              to="/host/create-event"
              className="inline-block mt-3 rounded-xl bg-green-700 text-white px-4 py-2 text-sm font-medium hover:bg-green-800"
            >
              Create an event
            </Link>
          </div>
        ) : success ? (
          <div className="mt-6 bg-green-50 rounded-2xl p-5">
            <div className="font-medium text-green-800">Request submitted!</div>
            <div className="text-sm text-green-600 mt-1">
              An admin will review your request. You'll be notified when approved.
            </div>
          </div>
        ) : (
          <>
            {/* Existing request status */}
            {existingRequest && (
              <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-4">
                <div className="text-sm font-medium text-slate-700">Your last request</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(existingRequest.status)}`}>
                    {existingRequest.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(existingRequest.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
                {existingRequest.status === "PENDING" && (
                  <div className="mt-2 text-xs text-slate-500">
                    Your request is being reviewed by an admin.
                  </div>
                )}
                {existingRequest.status === "REJECTED" && (
                  <div className="mt-2 text-xs text-slate-500">
                    Your request was rejected. You can submit a new one below.
                  </div>
                )}
              </div>
            )}

            {err && (
              <div className="mt-4 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">{err}</div>
            )}

            {/* Form */}
            {(!existingRequest || existingRequest.status === "REJECTED") && (
              <div className="mt-6 bg-white rounded-2xl shadow p-6">
                <div className="text-sm text-slate-600 mb-4">
                  Tell us why you want to become a host. Admins will review your request.
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Why do you want to be a host?
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder="e.g. I want to organise food tours and local meetups in Cardiff..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="mt-4 w-full rounded-xl bg-slate-900 text-white py-3 text-sm font-medium hover:bg-slate-800 disabled:bg-slate-300"
                >
                  {loading ? "Submitting..." : "Submit request"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}