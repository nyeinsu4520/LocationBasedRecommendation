package com.example.locationapp.service;

import com.example.locationapp.dto.recommendation.RecommendationItemDTO;
import com.example.locationapp.util.DistanceCalculator;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class OverpassService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${app.overpass.url}")
    private String overpassUrl;

    public List<RecommendationItemDTO> fetchAll(double lat, double lng, double radiusKm) {
        int radiusMeters = (int) Math.round(radiusKm * 1000.0);

        // Overpass QL:
        // - hotels: tourism=hotel
        // - restaurants: amenity=restaurant
        // - attractions: tourism=attraction + leisure=park + historic=*
        // Use out center to get coordinates for ways/relations
        String query = """
                [out:json][timeout:25];
                (
                  node["tourism"="hotel"](around:%d,%f,%f);
                  way["tourism"="hotel"](around:%d,%f,%f);
                  relation["tourism"="hotel"](around:%d,%f,%f);

                  node["amenity"="restaurant"](around:%d,%f,%f);
                  way["amenity"="restaurant"](around:%d,%f,%f);
                  relation["amenity"="restaurant"](around:%d,%f,%f);

                  node["tourism"="attraction"](around:%d,%f,%f);
                  way["tourism"="attraction"](around:%d,%f,%f);
                  relation["tourism"="attraction"](around:%d,%f,%f);

                  node["leisure"="park"](around:%d,%f,%f);
                  way["leisure"="park"](around:%d,%f,%f);
                  relation["leisure"="park"](around:%d,%f,%f);

                  node["historic"](around:%d,%f,%f);
                  way["historic"](around:%d,%f,%f);
                  relation["historic"](around:%d,%f,%f);
                );
                out center;
                """.formatted(
                radiusMeters, lat, lng, radiusMeters, lat, lng, radiusMeters, lat, lng,
                radiusMeters, lat, lng, radiusMeters, lat, lng, radiusMeters, lat, lng,
                radiusMeters, lat, lng, radiusMeters, lat, lng, radiusMeters, lat, lng,
                radiusMeters, lat, lng, radiusMeters, lat, lng, radiusMeters, lat, lng,
                radiusMeters, lat, lng, radiusMeters, lat, lng, radiusMeters, lat, lng
        );

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_PLAIN);

            HttpEntity<String> entity = new HttpEntity<>(query, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    overpassUrl,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return List.of();
            }

            JsonNode root = mapper.readTree(response.getBody());
            JsonNode elements = root.get("elements");
            if (elements == null || !elements.isArray()) return List.of();

            List<RecommendationItemDTO> out = new ArrayList<>();

            for (JsonNode el : elements) {
                JsonNode tags = el.get("tags");
                if (tags == null) continue;

                String name = text(tags, "name");
                if (name == null || name.isBlank()) continue; // ignore unnamed

                // Coordinates
                Double itemLat = null;
                Double itemLng = null;

                if (el.has("lat") && el.has("lon")) {
                    itemLat = el.get("lat").asDouble();
                    itemLng = el.get("lon").asDouble();
                } else if (el.has("center")) {
                    JsonNode center = el.get("center");
                    if (center != null && center.has("lat") && center.has("lon")) {
                        itemLat = center.get("lat").asDouble();
                        itemLng = center.get("lon").asDouble();
                    }
                }
                if (itemLat == null || itemLng == null) continue;

                String type = inferTypeFromTags(tags);

                double distanceKm = DistanceCalculator.distance(lat, lng, itemLat, itemLng);

                String address = buildAddress(tags);
                String website = text(tags, "website");

                Map<String, String> tagMap = new HashMap<>();
                if (tags.isObject()) {
                    tags.fieldNames().forEachRemaining(k -> tagMap.put(k, tags.get(k).asText("")));
                }

                out.add(new RecommendationItemDTO(
                        "overpass",
                        type,
                        name,
                        itemLat,
                        itemLng,
                        distanceKm,
                        address,
                        website,
                        tagMap
                ));
            }

            return out;

        } catch (Exception e) {
            return List.of();
        }
    }

    private static String text(JsonNode tags, String key) {
        JsonNode v = tags.get(key);
        return v == null ? null : v.asText(null);
    }

    private static String buildAddress(JsonNode tags) {
        // addr:* tags are common in OSM
        String house = text(tags, "addr:housenumber");
        String street = text(tags, "addr:street");
        String city = text(tags, "addr:city");
        String postcode = text(tags, "addr:postcode");

        List<String> parts = new ArrayList<>();
        if (house != null && street != null) parts.add(house + " " + street);
        else {
            if (street != null) parts.add(street);
            if (house != null) parts.add(house);
        }
        if (city != null) parts.add(city);
        if (postcode != null) parts.add(postcode);

        if (parts.isEmpty()) return null;
        return String.join(", ", parts);
    }

    private static String inferTypeFromTags(JsonNode tags) {
        String tourism = text(tags, "tourism");
        String amenity = text(tags, "amenity");
        String leisure = text(tags, "leisure");
        String historic = tags.has("historic") ? tags.get("historic").asText("") : "";

        if ("hotel".equalsIgnoreCase(tourism)) return "hotel";
        if ("restaurant".equalsIgnoreCase(amenity)) return "restaurant";
        if ("attraction".equalsIgnoreCase(tourism)) return "attraction";
        if ("park".equalsIgnoreCase(leisure)) return "attraction";
        if (historic != null && !historic.isBlank()) return "attraction";

        return "place";
    }
}