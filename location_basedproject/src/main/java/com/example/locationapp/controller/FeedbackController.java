package com.example.locationapp.controller;

import com.example.locationapp.model.Feedback;
import com.example.locationapp.security.UserPrincipal;
import com.example.locationapp.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "http://localhost:5173")
public class FeedbackController {
    
    private final FeedbackService feedbackService;
    public FeedbackController(FeedbackService feedbackService){
        this.feedbackService = feedbackService;
    }

    @PostMapping("/{eventId}")
    public ResponseEntity<?> submitFeedback(
        @PathVariable Long eventId,
        @RequestBody Map<String,Object> body,
        @AuthenticationPrincipal UserPrincipal principal){
            try{
                int rating = (int) body.get("rating");
                String comment = (String) body.getOrDefault("comment", "");
                Feedback feedback = feedbackService.submitFeedback(eventId, principal.getUserId(), rating, comment);
                return ResponseEntity.ok(feedback);
            }catch(RuntimeException e){
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }

    @GetMapping("/{eventId}")
    public ResponseEntity<List<Feedback>> getFeedback(@PathVariable Long eventId){
        return ResponseEntity.ok(feedbackService.getEventFeedback(eventId));
    }

    @GetMapping("/{eventId}/average")
    public ResponseEntity<Map<String,Object>> getAverage(@PathVariable Long eventId){
        double avg = feedbackService.getAverageRating(eventId); 
        int count = feedbackService.getEventFeedback(eventId).size();
        return ResponseEntity.ok(Map.of("average",avg,"count",count ));
    }
}
