import axios from "axios";

// Nominatim usage requires a User-Agent or Referer.
// Browser requests usually include Referer automatically in dev.
// We keep it simple: use axios directly (not your backend api client).

export async function geocodePlace(query) {
  const res = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: {
      q: query,
      format: "json",
      addressdetails: 1,
      limit: 5,
    },
    // Some environments like adding this:
    headers: {
      "Accept-Language": "en",
    },
  });

  // Return simplified results
  return res.data.map((r) => ({
    displayName: r.display_name,
    lat: Number(r.lat),
    lng: Number(r.lon),
  }));
}