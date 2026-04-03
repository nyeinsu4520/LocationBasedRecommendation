import { useEffect, useMemo, useState } from "react";
import { recommendationsApi } from "../api/recommendationsApi";
import { geocodePlace } from "../api/geocodeApi";
import { eventsApi } from "../api/eventsApi";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "../map/fixLeafletIcons";
import { Link } from "react-router-dom";

export default function Locations() {
  const [err, setErr] = useState("");
  const [loadingNearby, setLoadingNearby] = useState(false);

  const [query, setQuery] = useState("");
  const [geoResults, setGeoResults] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);

  const [center, setCenter] = useState(null);
  const [gpsReady, setGpsReady] = useState(false);
  const [nearby, setNearby] = useState([]);
  const [nearbyEvents, setNearbyEvents] = useState([]);

  const [type, setType] = useState("all");
  const [budget, setBudget] = useState("any");

  const radiusOptionsKm = [1, 2, 5, 10];
  const [radiusKm, setRadiusKm] = useState(2);
  const radiusMeters = useMemo(() => radiusKm * 1000, [radiusKm]);
  const [joinedEventIds, setJoinedEventIds] = useState(new Set());

  const role = localStorage.getItem("role");
  const isHost = role === "HOST" || role === "HOST_PREMIUM";

  const [descriptions, setDescriptions] = useState({});
const [expandedCards, setExpandedCards] = useState(new Set()); 
const [loadingDesc, setLoadingDesc] = useState(new Set()); 

const toggleCard = async (loc) => {
  const key = loc.name;
  const newExpanded = new Set(expandedCards);

  if (newExpanded.has(key)) {
    newExpanded.delete(key);
    setExpandedCards(newExpanded);
    return;
  }

  newExpanded.add(key);
  setExpandedCards(newExpanded);

  if (!descriptions[key]) {
    const shouldFetchWikipedia = loc.type === "attraction" || loc.type === "hotel";

    if (shouldFetchWikipedia) {
      setLoadingDesc((prev) => new Set(prev).add(key));
      try {
        const desc = await recommendationsApi.getDescription(loc.name);
        setDescriptions((prev) => ({ ...prev, [key]: desc || null }));
      } catch {
        setDescriptions((prev) => ({ ...prev, [key]: null }));
      } finally {
        setLoadingDesc((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    } else {
      setDescriptions((prev) => ({ ...prev, [key]: null }));
    }
  }
};

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("role"); 
    window.location.href = "/login";
  };

  const loadNearbyEvents = async (lat, lng) => {
    try {
      const data = await eventsApi.nearby(lat, lng, radiusKm);
      setNearbyEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load nearby events:", error);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCenter({ lat: latitude, lng: longitude });
        setGpsReady(true);
        loadNearbyEvents(latitude, longitude);
      },
       (error) => {
      console.error("Location error:", error);
      // ✅ Only fall back to Cardiff if GPS fails
      setCenter({ lat: 51.4816, lng: -3.1791 });
      setGpsReady(true);
    },
    { enableHighAccuracy: true }
  );
}, []);

 useEffect(() => {
  if (!gpsReady || !center) return; 

  const loadNearby = async () => {
    try {
      setLoadingNearby(true);
      setErr("");
      const data = await recommendationsApi.get(
        center.lat, center.lng, radiusKm, type, budget
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
  loadNearbyEvents(center.lat, center.lng);
}, [center?.lat, center?.lng, radiusKm, type, budget, gpsReady]);


  

  useEffect(() => {
  const loadJoined = async () => {
    try {
      const data = await eventsApi.joined();
      setJoinedEventIds(new Set(data.map((m) => m.event?.id).filter(Boolean)));
    } catch {}
  };
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

  const joinEvent = (eventId) => {
      window.location.href = `/events/${eventId}/chat`;
  };

  function formatOpeningHours(raw) {
  if (!raw) return null;
  // If it's already short enough, show as-is
  if (raw.length < 40) return `Hours: ${raw}`;
  // Otherwise truncate
  return `Hours: ${raw.substring(0, 37)}...`;
}

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Search & Recommend
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Search a place, then find host-created events nearby.
            </p>
          </div>
        </div>

        {err && (
          <div className="mt-4 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
            {err}
          </div>
        )}

        {/* Search bar */}
        <div className="mt-6 bg-white rounded-2xl shadow p-4">
          <form onSubmit={onSearch} className="flex gap-2 flex-wrap">
            <input
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
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
                  <option key={km} value={km}>{km} km</option>
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
                  <div className="text-sm font-medium text-slate-900">{r.displayName}</div>
                  <div className="text-xs text-slate-500">
                    {r.lat.toFixed(5)}, {r.lng.toFixed(5)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map + Recommendations */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-900">Map</h2>
              <div className="text-sm text-slate-500">
                {center
                  ? `Center: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`
                  : "Getting your location..."}
              </div>
            </div>
            <div className="relative z-0 h-[520px] rounded-xl overflow-hidden">
              {center ? (
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

                {/* Recommendation pins */}
                {nearby.map((loc, idx) => (
                  <Marker
                    key={`rec-${loc.source}-${loc.name}-${idx}`}
                    position={[loc.latitude, loc.longitude]}
                  >
                    <Popup>
                      <div className="font-semibold">{loc.name}</div>
                      <div className="text-sm capitalize">{loc.type} • {loc.source}</div>
                      {loc.distanceKm != null && (
                        <div className="text-xs mt-1">{loc.distanceKm.toFixed(2)} km away</div>
                      )}
                    </Popup>
                  </Marker>
                ))}

                {/* Event pins */}
                {nearbyEvents.map((event) => (
                  <Marker key={`event-${event.id}`} position={[event.latitude, event.longitude]}>
                    <Popup>
                      <div className="font-semibold">{event.title}</div>
                      <div className="text-sm text-slate-500">{event.locationName}</div>
                      {event.eventDate && (
                        <div className="text-xs mt-1">
                          {new Date(event.eventDate).toLocaleDateString()}
                        </div>
                      )}
                      <div className="text-xs mt-1">
                        {event.spotsLeft > 0 ? `${event.spotsLeft} spots left` : "Full"}
                      </div>
                      {/* ✅ Open Chat if joined, Join Event if not */}
                      {joinedEventIds.has(event.id) ? (
                        <button onClick={() => joinEvent(event.id)} className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm w-full">
                          Open Chat
                        </button>
                      ) : event.spotsLeft > 0 ? (
                        <button onClick={() => joinEvent(event.id)} className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm w-full">
                          Join Event
                        </button>
                      ) : null}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              ) : (
                <div className="h-full bg-slate-100 flex items-center justify-center rounded-xl">
                  <div className="text-sm text-slate-500">Getting your location...</div>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-lg font-semibold text-slate-900">Recommendations</h2>
            <div className="mt-2 text-sm text-slate-500">
              {loadingNearby ? "Loading..." : `${nearby.length} place(s) found`}
            </div>
            <div className="mt-4 space-y-3">
              {nearby.map((l, idx) => {
                                const locationEvents = nearbyEvents.filter((event) => {
                  // ✅ Primary match: location name similarity
                  const eventName = event.locationName?.toLowerCase().trim() || "";
                  const locName = l.name?.toLowerCase().trim() || "";
                  const nameMatch = eventName === locName ||
                    eventName.includes(locName) ||
                    locName.includes(eventName);

                  // ✅ Secondary match: very tight distance (~50m) AND name must partially match
                  const latDiff = Math.abs(event.latitude - (l.lat ?? l.latitude));
                  const lngDiff = Math.abs(event.longitude - (l.lon ?? l.longitude));
                  const distanceMatch = latDiff < 0.0005 && lngDiff < 0.0005;

                  // ✅ Only show if name matches — distance alone is not enough
                  return nameMatch && distanceMatch;
                });
                

                return (
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
                      onClick={() => toggleCard(l)}
                      className="mt-2 text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                    >
                      {expandedCards.has(l.name) ? "▲ Less info" : "▼ More info"}
                    </button>

                    {expandedCards.has(l.name) && (
                      <div className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-2">
                        {loadingDesc.has(l.name) ? (
                          <span className="text-slate-400">Loading description...</span>
                        ) : descriptions[l.name] ? (
                          descriptions[l.name]
                        ) : (
                          // ✅ Auto-generated for restaurants and fallback
                          l.type === "restaurant" && l.cuisine
                            ? `A ${l.cuisine} restaurant${l.address ? ` at ${l.address}` : " nearby"}.`
                            : l.type === "restaurant"
                            ? `A restaurant${l.address ? ` at ${l.address}` : " nearby"}.`
                            : l.type === "hotel"
                            ? `A hotel${l.address ? ` at ${l.address}` : " nearby"}.`
                            : l.type === "attraction"
                            ? `A local attraction${l.address ? ` at ${l.address}` : ""}.`
                            : `A ${l.type || "place"} located nearby.`
                        )}
                      </div>
                    )}
                    {isHost && (
                      <div className="mt-2 space-y-2">
                      <Link
                        to={`/host/create-event?name=${encodeURIComponent(l.name)}&lat=${l.lat ?? l.latitude}&lng=${l.lon ?? l.longitude}&address=${encodeURIComponent(l.address || "")}`}
                        className="text-xs px-5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 whitespace-nowrap"
                      >
                        Host event here
                      </Link>
                      </div>
                    )}

                    {locationEvents.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {locationEvents.map((event) => (
                          <div
                            key={event.id}
                            className="bg-blue-50 rounded-lg px-3 py-2 flex items-center justify-between gap-2"
                          >
                            <div>
                              <div className="text-sm font-medium text-blue-800">
                                {event.title}
                              </div>
                              <div className="text-xs text-blue-600 mt-0.5">
                                {event.eventDate
                                  ? new Date(event.eventDate).toLocaleDateString("en-GB", {
                                      weekday: "short",
                                      day: "numeric",
                                      month: "short",
                                    })
                                  : "Date TBC"}
                                {event.spotsLeft > 0
                                  ? ` · ${event.spotsLeft} spots left`
                                  : " · Full"}
                              </div>
                            </div>
                             {joinedEventIds.has(event.id) ? (
                              <button onClick={() => joinEvent(event.id)} className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 whitespace-nowrap">
                                Open Chat
                              </button>
                            ) : event.spotsLeft > 0 ? (
                              <button onClick={() => joinEvent(event.id)} className="text-xs px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-700 hover:bg-blue-100 whitespace-nowrap">
                                Join event
                              </button>
                            ) : (
                              <span className="text-xs text-red-500 font-medium">Full</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-slate-400">
                        No events here yet
                      </div>
                    )}
                  </div>
                );
              })}
              {!loadingNearby && nearby.length === 0 && (
                <div className="text-sm text-slate-500">
                  No recommendations found. Try a bigger radius.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}