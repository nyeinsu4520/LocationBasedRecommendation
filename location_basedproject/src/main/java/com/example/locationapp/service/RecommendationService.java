package com.example.locationapp.service;

import com.example.locationapp.dto.recommendation.RecommendationItemDTO;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RecommendationService {

    private final OverpassService overpassService;
    private final OpenTripMapService openTripMapService;

    public RecommendationService(OverpassService overpassService, OpenTripMapService openTripMapService) {
        this.overpassService = overpassService;
        this.openTripMapService = openTripMapService;
    }

    public List<RecommendationItemDTO> getRecommendations(double lat, double lng, double radiusKm, String type,String budget) {

        List<RecommendationItemDTO> overpassItems = overpassService.fetchAll(lat, lng, radiusKm);
        List<RecommendationItemDTO> otmItems = openTripMapService.fetchAttractions(lat, lng, radiusKm);

        List<RecommendationItemDTO> all = new ArrayList<>();
        all.addAll(overpassItems);
        all.addAll(otmItems);

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
        if(!b.equals("any")) {
            all.removeIf(item -> {
                String level = estimateBudgetLevel(item);
                if(level.equals("unknown")) level = "medium";
                return !level.equals(b);
            });
        }

        Map<String, RecommendationItemDTO> unique = new LinkedHashMap<>();

        for (RecommendationItemDTO item : all) {
            String name = item.getName() == null ? "" : item.getName().trim().toLowerCase(Locale.ROOT);
            String key = name
                    + "|" + round(item.getLatitude(), 4)
                    + "|" + round(item.getLongitude(), 4);

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

        if (result.size() > 80) {
            result = result.subList(0, 80);
        }

        return result;
    }

    private static double round(double v, int decimals) {
        double p = Math.pow(10, decimals);
        return Math.round(v * p) / p;
    }

    private static String safe(String s){
        return s == null ? "" : s.trim().toLowerCase(Locale.ROOT);
    }

    private String estimateBudgetLevel(RecommendationItemDTO item){
        String type = safe(item.getType());
        Map<String,String> tags = item.getTags() == null? Map.of() : item.getTags();

        if(type.equals ("hotels")){
            String starsStr = tags.getOrDefault("starts", tags.getOrDefault("hotel:stars", ""));
            Integer stars = parseIntSafe(starsStr);

            if(stars != null){
                if(stars >=4) return "high";
                if(stars == 3) return "medium";
                return "low";
            }

            boolean hasWebsite = item.getWebsite() != null && !item.getWebsite().isBlank();
            boolean hasAddress = item.getAddress() != null && !item.getAddress().isBlank();
            if(hasWebsite && hasAddress) return "medium";
            return "unknown";
        }

        if(type.equals("restaurant")){
            String amentity = safe(tags.get("amenity"));
            if(amentity.equals("fast_food")) return "low";

            String cuisine = tags.getOrDefault("cuisine", "");
            if(!cuisine.isBlank()) return "medium";

            String takeaway = safe(tags.get("takeaway"));
            String outdoor = safe(tags.get("outdoor_seating"));
            if(takeaway.equals("no") && outdoor.equals("yes")) return "medium";
            return "unknown";
        }

        if(type.equals("attraction")){
            return "medium";
        }
        return "unknown";

    }

    private Integer parseIntSafe(String s){
        try{
            if (s == null || s.isBlank()) return null;
            return Integer.parseInt(s.trim());
        }catch(Exception e){
            return null;
        }
    }
}