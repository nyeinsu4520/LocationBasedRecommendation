import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { eventsApi } from "../api/eventsApi";

export default function EditEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const isPremium = role === "HOST_PREMIUM";
  const maxAllowed = isPremium ? 50 : 10;

  const [form, setForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    locationName: "",
    address: "",
    maxAttendees: 10,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [err, setErr] = useState("");

  // ✅ Load existing event data
  useEffect(() => {
    const loadEvent = async () => {
      try {
        const event = await eventsApi.getById(eventId);
        setForm({
          title: event.title || "",
          description: event.description || "",
          eventDate: event.eventDate
            ? new Date(event.eventDate).toISOString().slice(0, 16)
            : "",
          locationName: event.locationName || "",
          address: event.address || "",
          maxAttendees: event.maxAttendees || 10,
        });
      } catch {
        setErr("Failed to load event.");
      } finally {
        setFetching(false);
      }
    };
    loadEvent();
  }, [eventId]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "maxAttendees" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.title.trim()) return setErr("Title is required.");
    if (!form.eventDate) return setErr("Date and time is required.");
    if (form.maxAttendees < 1 || form.maxAttendees > maxAllowed) {
      return setErr(`Max attendees must be between 1 and ${maxAllowed}.`);
    }

    try {
      setLoading(true);
      await eventsApi.update(eventId, {
        ...form,
        eventDate: new Date(form.eventDate).toISOString(),
      });
      navigate(`/events/${eventId}/chat`);
    } catch (error) {
      setErr(error.response?.data || "Failed to update event.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-slate-500">Loading event...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-xl mx-auto p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Edit event</h1>
            <p className="text-slate-500 text-sm mt-1">Update your event details.</p>
          </div>
        </div>

        <div className="mt-4">
          {isPremium ? (
            <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-purple-100 text-purple-700">
              Premium host — up to 50 attendees
            </span>
          ) : (
            <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              Free host — up to 10 attendees
            </span>
          )}
        </div>

        {err && (
          <div className="mt-4 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">{err}</div>
        )}

        <div className="mt-6 bg-white rounded-2xl shadow p-6 space-y-5">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Event title</label>
            <input
              name="title"
              value={form.title}
              onChange={handle}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handle}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date & time</label>
            <input
              type="datetime-local"
              name="eventDate"
              value={form.eventDate}
              onChange={handle}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location name</label>
            <input
              name="locationName"
              value={form.locationName}
              onChange={handle}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handle}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Max attendees
              <span className="ml-2 text-xs font-normal text-slate-400">
                (max {maxAllowed} on your plan)
              </span>
            </label>
            <input
              type="number"
              name="maxAttendees"
              value={form.maxAttendees}
              onChange={handle}
              min={1}
              max={maxAllowed}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            {!isPremium && (
              <p className="mt-1.5 text-xs text-slate-400">
                Upgrade to premium to host up to 50 attendees.
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 text-white py-3 text-sm font-medium hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}