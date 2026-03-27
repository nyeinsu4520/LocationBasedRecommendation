package com.example.locationapp.controller;

import com.example.locationapp.dto.recommendation.RecommendationItemDTO;
import com.example.locationapp.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "http://localhost:5173")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping
    public ResponseEntity<List<RecommendationItemDTO>> getRecommendations(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam double radiusKm,
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(defaultValue = "any" ) String budget
    ) {
        return ResponseEntity.ok(
                recommendationService.getRecommendations(lat, lng, radiusKm, type, budget)
        );
    }
}