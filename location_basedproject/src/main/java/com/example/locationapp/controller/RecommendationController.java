package com.example.locationapp.controller;

import com.example.locationapp.dto.recommendation.RecommendationItemDTO;
import com.example.locationapp.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

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
    @GetMapping("/description")
    public ResponseEntity<String> getDescription(@RequestParam String name) {
    try {
        String encodedName = java.net.URLEncoder.encode(name,"UTF-8").replace("+","%20");
        String url = "https://en.wikipedia.org/appi/rest_v1/page/summary/"+encodedName;
        System.out.println("==>Wikipedia URL:" + url);
        RestTemplate rt = new RestTemplate();
        ResponseEntity<String> res = rt.getForEntity(url, String.class);
        
        if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null) {
            com.fasterxml.jackson.databind.ObjectMapper mapper = 
                new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = 
                mapper.readTree(res.getBody());
            
            com.fasterxml.jackson.databind.JsonNode extract = 
                root.get("extract");
            if (extract != null && !extract.asText().isBlank()) {
                // ✅ Return first 2 sentences only
                String text = extract.asText();
                String[] sentences = text.split("\\. ");
                String short_desc = sentences.length >= 2
                    ? sentences[0] + ". " + sentences[1] + "."
                    : text;
                return ResponseEntity.ok(short_desc);
            }
            com.fasterxml.jackson.databind.JsonNode desc = root.get("description");
            if(desc != null && !desc.asText().isBlank()){
                return ResponseEntity.ok(desc.asText());
            }
        }
        return ResponseEntity.ok(null);
    } catch (Exception e) {
        System.out.println("==>wikipedia failed: " + e.getMessage());
        return ResponseEntity.ok(null);
    }
}
}