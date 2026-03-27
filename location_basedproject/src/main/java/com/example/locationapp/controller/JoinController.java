package com.example.locationapp.controller;

import com.example.locationapp.model.JoinEvent;
import com.example.locationapp.service.JoinService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "http://localhost:5173")
public class JoinController {
    private final JoinService joinService;

    public JoinController(JoinService joinService){
        this.joinService = joinService;
    }

    @PostMapping("/{locationId}/join")
    public ResponseEntity<JoinEvent> join(@PathVariable Long locationId, @RequestParam Long userId){
        return ResponseEntity.ok(joinService.join(userId, locationId));
    }

    @PostMapping("/{locationId}/leave")
    public ResponseEntity<Void> leave(@PathVariable Long locationId, @RequestParam Long userId) {
        joinService.leave(userId, locationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{locationId}/presence")
    public ResponseEntity<List<JoinEvent>> presence(@PathVariable Long locationId) {
        return ResponseEntity.ok(joinService.getPresence(locationId));
    }

    @GetMapping("/joined")
    public ResponseEntity<List<JoinEvent>> joined(@RequestParam Long userId) {
        return ResponseEntity.ok(joinService.getJoinedLocations(userId));
    }
}