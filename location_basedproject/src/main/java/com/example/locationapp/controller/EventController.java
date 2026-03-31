package com.example.locationapp.controller;

import com.example.locationapp.model.Event;
import com.example.locationapp.model.EventMember;
import com.example.locationapp.model.Role;
import com.example.locationapp.security.UserPrincipal;
import com.example.locationapp.service.EventService;
import com.example.locationapp.dto.EventSummaryDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // ✅ HOST: create an event
    @PostMapping
    public ResponseEntity<?> createEvent(
            @RequestBody Event event,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal.getRole() != Role.HOST) {
            return ResponseEntity.status(403).body("Only hosts can create events");
        }
        // Premium check — extend this when you add premium logic
        boolean isPremium = false;
        Event created = eventService.createEvent(event, principal.getUserId(), isPremium);
        return ResponseEntity.ok(created);
    }

    // ✅ USER: join an event
    @PostMapping("/{eventId}/join")
    public ResponseEntity<?> join(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            EventMember member = eventService.joinEvent(eventId, principal.getUserId());
            return ResponseEntity.ok(member);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ USER: leave an event
    @PostMapping("/{eventId}/leave")
    public ResponseEntity<?> leave(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        eventService.leaveEvent(eventId, principal.getUserId());
        return ResponseEntity.noContent().build();
    }

    // ✅ USER: get events they joined
    @GetMapping("/joined")
    public ResponseEntity<List<EventMember>> joined(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(eventService.getJoinedEvents(principal.getUserId()));
    }

    @GetMapping("/{eventId}/is-member")
    public ResponseEntity<Boolean> isMember(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(eventService.isMember(eventId, principal.getUserId()));
    }

    // ✅ ALL: nearby events on the map
    @GetMapping("/nearby")
    public ResponseEntity<List<EventSummaryDto>> nearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam double radiusKm
    ) {
        return ResponseEntity.ok(eventService.getNearbyEvents(lat, lng, radiusKm));
    }

    // ✅ HOST: their own events
    @GetMapping("/my-events")
    public ResponseEntity<List<EventSummaryDto>> myEvents(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(eventService.getHostEvents(principal.getUserId()));
    }

    // ✅ ALL: who is attending an event
    @GetMapping("/{eventId}/attendees")
    public ResponseEntity<List<EventMember>> attendees(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.getAttendees(eventId));
    }
}