import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom"; 
import { eventsApi } from "../api/eventsApi";
import { geocodePlace } from "../api/geocodeApi";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = localStorage.getItem("role");
  const isPremium = role === "HOST_PREMIUM";
  const maxAllowed = isPremium ? 50 : 10;

const [form, setForm] = useState({
  title: "",
  description: "",
  eventDate: "",
  locationName: searchParams.get("name") || "",      
  address: searchParams.get("address") || "",     
  latitude: searchParams.get("lat") ? Number(searchParams.get("lat")) : null,  
  longitude: searchParams.get("lng") ? Number(searchParams.get("lng")) : null, 
  maxAttendees: isPremium ? 50 : 10,
});

const [locationQuery, setLocationQuery] = useState(searchParams.get("name") || "");
  const [geoResults, setGeoResults] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "maxAttendees" ? Number(value) : value,
    }));
  };

  // ✅ Moved outside handleSubmit
  const searchLocation = async (e) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;
    try {
      setGeoLoading(true);
      setErr("");
      const results = await geocodePlace(locationQuery);
      setGeoResults(results);
      if (!results || results.length === 0) setErr("No results found. Try a different search.");
    } catch {
      setErr("Location search failed. Try again.");
    } finally {
      setGeoLoading(false);
    }
  };

  // ✅ Moved outside handleSubmit
  const pickLocation = (result) => {
    setForm((prev) => ({
      ...prev,
      locationName: result.displayName || locationQuery,
      latitude: result.lat,
      longitude: result.lng,
    }));
    setLocationQuery(result.displayName || locationQuery);
    setGeoResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.title.trim()) return setErr("Title is required.");
    if (!form.eventDate) return setErr("Date and time is required.");
    if (!form.locationName.trim()) return setErr("Location name is required.");
    if (!form.latitude || !form.longitude) return setErr("Please search and select a location.");
    if (form.maxAttendees < 1 || form.maxAttendees > maxAllowed) {
      return setErr(`Max attendees must be between 1 and ${maxAllowed}.`);
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        eventDate: new Date(form.eventDate).toISOString(),
      };
      const created = await eventsApi.create(payload);
      navigate(`/events/${created.id}/chat`);
    } catch (error) {
      setErr(error.response?.data || "Failed to create event. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-xl mx-auto p-6">

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Create an event</h1>
            <p className="text-slate-500 text-sm mt-1">
              Pick a location and set up your group event.
            </p>
          </div>
          <Link
            to="/locations"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Back
          </Link>
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

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Event title</label>
            <input
              name="title"
              value={form.title}
              onChange={handle}
              placeholder="e.g. Evening food tour"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handle}
              placeholder="What's this event about?"
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
            />
          </div>

          {/* Date & time */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date & time</label>
            <input
              type="datetime-local"
              name="eventDate"
              value={form.eventDate}
              onChange={handle}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          {/* ✅ Location search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <div className="flex gap-2">
              <input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") searchLocation(e); }}
                placeholder="Search for a place..."
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
              <button
                onClick={searchLocation}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium hover:bg-slate-100"
              >
                {geoLoading ? "..." : "Search"}
              </button>
            </div>

            {/* Dropdown results */}
            {geoResults.length > 0 && (
              <div className="mt-1 rounded-xl border border-slate-200 overflow-hidden">
                {geoResults.map((r, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => pickLocation(r)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                  >
                    <div className="text-sm font-medium text-slate-900">{r.displayName}</div>
                    <div className="text-xs text-slate-500">
                      {r.lat.toFixed(5)}, {r.lng.toFixed(5)}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* ✅ Confirmation when picked */}
            {form.latitude && form.longitude && (
              <div className="mt-2 text-xs text-green-600 font-medium">
                Location set: {form.locationName}
              </div>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handle}
              placeholder="e.g. 12 High Street, Cardiff"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          {/* Max attendees */}
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
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            {!isPremium && (
              <p className="mt-1.5 text-xs text-slate-400">
                Need more than 10 attendees?{" "}
                <span className="text-purple-600 font-medium cursor-pointer hover:underline">
                  Upgrade to premium
                </span>
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 text-white py-3 text-sm font-medium hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create event"}
          </button>
        </div>
      </div>
    </div>
  );
}