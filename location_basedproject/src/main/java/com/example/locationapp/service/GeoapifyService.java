package com.example.locationapp.service;

import com.example.locationapp.dto.recommendation.RecommendationItemDTO;
import com.example.locationapp.util.DistanceCalculator;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeoapifyService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${app.geoapify.key}")
    private String apiKey;

    public List<RecommendationItemDTO> fetchAll(double lat, double lng, double radiusKm, String categories) {
        int radiusMeters = (int) Math.round(radiusKm * 1000.0);

        

        String url = "https://api.geoapify.com/v2/places" +
                "?categories=" + categories +
                "&filter=circle:" + lng + "," + lat + "," + radiusMeters +
                "&bias=proximity:" + lng + "," + lat +
                "&limit=30" +
                "&apiKey=" + apiKey;

        System.out.println("==> Geoapify request: " + url);

        try {
            String response = restTemplate.getForObject(url, String.class);
            if (response == null) return List.of();

            JsonNode root = mapper.readTree(response);
            JsonNode features = root.get("features");
            if (features == null || !features.isArray()) return List.of();

            List<RecommendationItemDTO> out = new ArrayList<>();

            for (JsonNode feature : features) {
                JsonNode props = feature.get("properties");
                if (props == null) continue;

                String name = props.has("name") ? props.get("name").asText("") : "";
                if (name.isBlank()) continue;

                // ✅ Geoapify returns coordinates in geometry
                JsonNode geometry = feature.get("geometry");
                if (geometry == null) continue;
                JsonNode coords = geometry.get("coordinates");
                if (coords == null || !coords.isArray()) continue;

                double itemLng = coords.get(0).asDouble();
                double itemLat = coords.get(1).asDouble();

                double distanceKm = DistanceCalculator.distance(lat, lng, itemLat, itemLng);

                String type = inferType(props);
                String address = buildAddress(props);
                String website = props.has("website") ? props.get("website").asText(null) : null;
                String phone = props.has("phone") ? props.get("phone").asText(null) : null;
                String openingHours = props.has("opening_hours")
                        ? props.get("opening_hours").asText(null) : null;
                String cuisine = props.has("catering.cuisine")
                        ? props.get("catering.cuisine").asText(null) : null;
                String email = props.has("email") ? props.get("email").asText(null) : null;

                Map<String, String> tags = new HashMap<>();
                props.fieldNames().forEachRemaining(k ->
                        tags.put(k, props.get(k).asText("")));

                out.add(new RecommendationItemDTO(
                        "geoapify",
                        type,
                        name,
                        itemLat,
                        itemLng,
                        distanceKm,
                        address,
                        website,
                        tags,
                        openingHours,
                        phone,
                        cuisine,
                        email
                ));
            }

            System.out.println("==> Geoapify returned " + out.size() + " results");
            return out;

        } catch (Exception e) {
            System.out.println("==> Geoapify failed: " + e.getMessage());
            return List.of();
        }
    }

    private String inferType(JsonNode props) {
        String categories = props.has("categories")
                ? props.get("categories").toString().toLowerCase() : "";

        if (categories.contains("accommodation")) return "hotel";
        if (categories.contains("catering")) return "restaurant";
        if (categories.contains("tourism") || categories.contains("heritage")
                || categories.contains("leisure")) return "attraction";

        return "place";
    }

    private String buildAddress(JsonNode props) {
        List<String> parts = new ArrayList<>();

        if (props.has("housenumber") && props.has("street")) {
            parts.add(props.get("housenumber").asText() + " " + props.get("street").asText());
        } else if (props.has("street")) {
            parts.add(props.get("street").asText());
        }
        if (props.has("city")) parts.add(props.get("city").asText());
        if (props.has("postcode")) parts.add(props.get("postcode").asText());

        if (parts.isEmpty() && props.has("formatted")) {
            return props.get("formatted").asText(null);
        }

        return parts.isEmpty() ? null : String.join(", ", parts);
    }
}