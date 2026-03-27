package com.example.locationapp.service;

import com.example.locationapp.dto.recommendation.RecommendationItemDTO;
import com.example.locationapp.util.DistanceCalculator;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class OpenTripMapService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${app.opentripmap.url}")
    private String baseUrl;

    @Value("${app.opentripmap.key:}")
    private String apiKey;

    public List<RecommendationItemDTO> fetchAttractions(double lat, double lng, double radiusKm) {
        // If no key, return empty list (Overpass can still work)
        if (apiKey == null || apiKey.isBlank()) return List.of();

        int radiusMeters = (int) Math.round(radiusKm * 1000.0);

        // OpenTripMap radius endpoint (basic list)
        // kinds: interesting_places,tourist_facilities,museums,architecture,natural
        String url = baseUrl + "/radius?radius=" + radiusMeters
                + "&lon=" + lng + "&lat=" + lat
                + "&kinds=interesting_places,tourist_facilities,museums,architecture,natural"
                + "&format=json"
                + "&limit=50"
                + "&apikey=" + apiKey;

        try {
            ResponseEntity<String> res = restTemplate.getForEntity(url, String.class);
            if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) return List.of();

            JsonNode arr = mapper.readTree(res.getBody());
            if (!arr.isArray()) return List.of();

            List<RecommendationItemDTO> out = new ArrayList<>();

            for (JsonNode it : arr) {
                String name = it.get("name") != null ? it.get("name").asText("") : "";
                if (name.isBlank()) continue;

                double itemLat = it.get("point").get("lat").asDouble();
                double itemLng = it.get("point").get("lon").asDouble();

                double distanceKm = DistanceCalculator.distance(lat, lng, itemLat, itemLng);

                // kinds is a string like "architecture,interesting_places,..."
                String kinds = it.get("kinds") != null ? it.get("kinds").asText("") : "";

                Map<String, String> tags = new HashMap<>();
                tags.put("kinds", kinds);

                out.add(new RecommendationItemDTO(
                        "opentripmap",
                        "attraction",
                        name,
                        itemLat,
                        itemLng,
                        distanceKm,
                        null,
                        null,
                        tags
                ));
            }

            return out;

        } catch (Exception e) {
            return List.of();
        }
    }
}