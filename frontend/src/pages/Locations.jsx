import { useEffect, useMemo, useState } from "react";
import { recommendationsApi } from "../api/recommendationsApi";
import { geocodePlace } from "../api/geocodeApi";
import { locationsApi } from "../api/locationsApi";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "../map/fixLeafletIcons";
import { Link } from "react-router-dom";

export default function Locations() {
  const [err, setErr] = useState("");
  const [loadingNearby, setLoadingNearby] = useState(false);

  const [query, setQuery] = useState("");
  const [geoResults, setGeoResults] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);

  const [center, setCenter] = useState({ lat: 51.4816, lng: -3.1791 });
  const [nearby, setNearby] = useState([]);

  const [type, setType] = useState("all");
  const [budget, setBudget] = useState("any");

  const radiusOptionsKm = [1, 2, 5, 10];
  const [radiusKm, setRadiusKm] = useState(2);
  const radiusMeters = useMemo(() => radiusKm * 1000, [radiusKm]);

  const [joinedChats, setJoinedChats] = useState([]);
  const [loadingJoined, setLoadingJoined] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    window.location.href = "/login";
  };

  const loadJoinedChats = async () => {
    try {
      setLoadingJoined(true);
      const data = await locationsApi.joined();
      console.log("joined chats data:", data);
      setJoinedChats(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load joined chats:", error);
    } finally {
      setLoadingJoined(false);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("User location:", latitude, longitude);
        setCenter({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error("Location error:", error);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    const loadNearby = async () => {
      try {
        setLoadingNearby(true);
        setErr("");
        const data = await recommendationsApi.get(
          center.lat,
          center.lng,
          radiusKm,
          type,
          budget
        );
        setNearby(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load recommendations:", error);
        setErr("Failed to load recommendations.");
      } finally {
        setLoadingNearby(false);
      }
    };

    loadNearby();
  }, [center.lat, center.lng, radiusKm, type, budget]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found, skipping loadJoinedChats");
      return;
    }
    loadJoinedChats();
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

      if (!results || results.length === 0) {
        setErr("No results found. Try a different search.");
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      setErr("Geocoding failed. Try again.");
    } finally {
      setGeoLoading(false);
    }
  };

  const chooseResult = (r) => {
    setCenter({ lat: r.lat, lng: r.lng });
    setGeoResults([]);
  };

  const joinLocation = async (loc) => {
    try {
      setErr("");

      const savedLocation = await locationsApi.create({
        name: loc.name || "Unknown place",
        category: loc.kinds || loc.type || "general",
        latitude: loc.lat ?? loc.latitude,
        longitude: loc.lon ?? loc.longitude,
        description: loc.wikipedia || loc.address || loc.name || ""
      });

      console.log("savedLocation:", savedLocation);

      await locationsApi.join(savedLocation.id);
      await loadJoinedChats();

      window.location.href = `/locations/${savedLocation.id}/chat`;
    } catch (error) {
      console.error("Failed to join:", error);
      setErr("Failed to join chat.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Search & Recommend
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Search a place, then we recommend nearby locations.
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Logout
          </button>
        </div>

        {err && (
          <div className="mt-4 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
            {err}
          </div>
        )}

        <div className="mt-6 bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Your Joined Chats
          </h2>

          <div className="mt-2 text-sm text-slate-500">
            {loadingJoined ? "Loading..." : `${joinedChats.length} joined chat(s)`}
          </div>

          <div className="mt-4 space-y-3">
            {joinedChats.map((j, index) => {
              const location = j.location || j;
              const locationId = location?.id;
              const locationName = location?.name || "Unknown location";
              const locationCategory = location?.category || "general";

              return (
                <div
                  key={j.id || locationId || index}
                  className="rounded-xl border border-slate-200 p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {locationName}
                    </div>
                    <div className="text-sm text-slate-500">
                      {locationCategory}
                    </div>
                  </div>

                  {locationId ? (
                    <Link
                      to={`/locations/${locationId}/chat`}
                      className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
                    >
                      Open Chat
                    </Link>
                  ) : (
                    <span className="text-sm text-slate-400">No chat</span>
                  )}
                </div>
              );
            })}

            {!loadingJoined && joinedChats.length === 0 && (
              <div className="text-sm text-slate-500">
                You have not joined any chats yet.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow p-4">
          <form onSubmit={onSearch} className="flex gap-2 flex-wrap">
            <input
              className="flex-1 min-w-[240px] rounded-xl border border-slate-200 px-3 py-2"
              placeholder="Search city / address / place"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button
              type="submit"
              className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
            >
              {geoLoading ? "Searching..." : "Search"}
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-600">Radius</span>

              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
              >
                {radiusOptionsKm.map((km) => (
                  <option key={km} value={km}>
                    {km} km
                  </option>
                ))}
              </select>

              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="all">All</option>
                <option value="hotels">Hotels</option>
                <option value="restaurants">Restaurants</option>
                <option value="attractions">Attractions</option>
              </select>

              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              >
                <option value="any">Any budget</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </form>

          {geoResults.length > 0 && (
            <div className="mt-3 rounded-xl border border-slate-200 overflow-hidden">
              {geoResults.map((r, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => chooseResult(r)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50"
                >
                  <div className="text-sm font-medium text-slate-900">
                    {r.displayName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {r.lat.toFixed(5)}, {r.lng.toFixed(5)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-900">Map</h2>
              <div className="text-sm text-slate-500">
                Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
              </div>
            </div>

            <div className="h-[520px] rounded-xl overflow-hidden">
              <MapContainer
                center={[center.lat, center.lng]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                key={`${center.lat}-${center.lng}`}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[center.lat, center.lng]}>
                  <Popup>Search center</Popup>
                </Marker>

                <Circle center={[center.lat, center.lng]} radius={radiusMeters} />

                {nearby.map((loc, idx) => (
                  <Marker
                    key={`${loc.source}-${loc.type}-${loc.name}-${idx}`}
                    position={[loc.latitude, loc.longitude]}
                  >
                    <Popup>
                      <div className="font-semibold">{loc.name}</div>

                      <div className="text-sm capitalize">
                        {loc.type} • {loc.source}
                      </div>

                      {loc.distanceKm != null && (
                        <div className="text-xs mt-1">
                          {loc.distanceKm.toFixed(2)} km away
                        </div>
                      )}

                      {loc.address && (
                        <div className="text-xs mt-1">{loc.address}</div>
                      )}

                      {loc.website && (
                        <div className="text-xs mt-1">
                          <a
                            className="text-blue-600 underline"
                            href={loc.website}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Recommendations
            </h2>

            <div className="mt-2 text-sm text-slate-500">
              {loadingNearby ? "Loading..." : `${nearby.length} place(s) found`}
            </div>

            <div className="mt-4 space-y-3">
              {nearby.map((l, idx) => (
                <div
                  key={`${l.source}-${l.type}-${l.name}-${idx}`}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <div className="font-medium text-slate-900">{l.name}</div>

                  <div className="text-sm text-slate-500 capitalize">
                    {l.type} • {l.source}
                  </div>

                  {l.distanceKm != null && (
                    <div className="text-sm text-slate-600 mt-1">
                      {l.distanceKm.toFixed(2)} km away
                    </div>
                  )}

                  {l.address && (
                    <div className="text-sm text-slate-600 mt-1">{l.address}</div>
                  )}

                  <button
                    onClick={() => joinLocation(l)}
                    className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Join Chat
                  </button>
                </div>
              ))}

              {!loadingNearby && nearby.length === 0 && (
                <div className="text-sm text-slate-500">
                  No recommendations found. Try a bigger radius or different search.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}