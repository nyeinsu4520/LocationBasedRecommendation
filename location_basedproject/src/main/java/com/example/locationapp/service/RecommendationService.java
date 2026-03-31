package com.example.locationapp.service;

import com.example.locationapp.dto.recommendation.RecommendationItemDTO;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RecommendationService {

    private final GeoapifyService geoapifyService;

    public RecommendationService(GeoapifyService geoapifyService) {
        this.geoapifyService = geoapifyService;
    }

    @Cacheable(value = "recommendations",
               key = "T(Math).round(#lat * 100) + ',' + T(Math).round(#lng * 100) + ',' + #radiusKm")
    public List<RecommendationItemDTO> getRecommendations(
            double lat, double lng, double radiusKm, String type, String budget) {

        List<RecommendationItemDTO> all = new ArrayList<>(
                geoapifyService.fetchAll(lat, lng, radiusKm) 
        );

        String t = (type == null ? "all" : type.toLowerCase(Locale.ROOT));
        if (!t.equals("all")) {
            all.removeIf(item -> {
                String itemType = item.getType() == null ? "" : item.getType().toLowerCase(Locale.ROOT);
                return switch (t) {
                    case "hotels" -> !itemType.equals("hotel");
                    case "restaurants" -> !itemType.equals("restaurant");
                    case "attractions" -> !itemType.equals("attraction");
                    default -> false;
                };
            });
        }

        String b = (budget == null ? "any" : budget.toLowerCase(Locale.ROOT));
        if (!b.equals("any")) {
            all.removeIf(item -> {
                String level = estimateBudgetLevel(item);
                if (level.equals("unknown")) level = "medium";
                return !level.equals(b);
            });
        }

        Map<String, RecommendationItemDTO> unique = new LinkedHashMap<>();
        for (RecommendationItemDTO item : all) {
            String name = item.getName() == null ? "" : item.getName().trim().toLowerCase(Locale.ROOT);
            String key = name + "|" + round(item.getLatitude(), 4) + "|" + round(item.getLongitude(), 4);
            if (!unique.containsKey(key)) {
                unique.put(key, item);
            } else {
                RecommendationItemDTO existing = unique.get(key);
                if ("overpass".equalsIgnoreCase(item.getSource())
                        && !"overpass".equalsIgnoreCase(existing.getSource())) {
                    unique.put(key, item);
                }
            }
        }

        List<RecommendationItemDTO> result = new ArrayList<>(unique.values());
        result.sort(Comparator.comparingDouble(r -> r.getDistanceKm() == null ? 999999.0 : r.getDistanceKm()));

        // ✅ Reduced from 80 to 30 — faster response, less rendering
        if (result.size() > 30) result = result.subList(0, 30);

        return result;
    }

    private static double round(double v, int decimals) {
        double p = Math.pow(10, decimals);
        return Math.round(v * p) / p;
    }

    private static String safe(String s) {
        return s == null ? "" : s.trim().toLowerCase(Locale.ROOT);
    }

    private String estimateBudgetLevel(RecommendationItemDTO item) {
        String type = safe(item.getType());
        Map<String, String> tags = item.getTags() == null ? Map.of() : item.getTags();

        if (type.equals("hotels")) {
            String starsStr = tags.getOrDefault("starts", tags.getOrDefault("hotel:stars", ""));
            Integer stars = parseIntSafe(starsStr);
            if (stars != null) {
                if (stars >= 4) return "high";
                if (stars == 3) return "medium";
                return "low";
            }
            boolean hasWebsite = item.getWebsite() != null && !item.getWebsite().isBlank();
            boolean hasAddress = item.getAddress() != null && !item.getAddress().isBlank();
            if (hasWebsite && hasAddress) return "medium";
            return "unknown";
        }

        if (type.equals("restaurant")) {
            String amenity = safe(tags.get("amenity"));
            if (amenity.equals("fast_food")) return "low";
            String cuisine = tags.getOrDefault("cuisine", "");
            if (!cuisine.isBlank()) return "medium";
            String takeaway = safe(tags.get("takeaway"));
            String outdoor = safe(tags.get("outdoor_seating"));
            if (takeaway.equals("no") && outdoor.equals("yes")) return "medium";
            return "unknown";
        }

        if (type.equals("attraction")) return "medium";
        return "unknown";
    }

    private Integer parseIntSafe(String s) {
        try {
            if (s == null || s.isBlank()) return null;
            return Integer.parseInt(s.trim());
        } catch (Exception e) {
            return null;
        }
    }
}