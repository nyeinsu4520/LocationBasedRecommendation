package com.example.locationapp.controller;

import com.example.locationapp.model.Event;
import com.example.locationapp.model.EventMember;
import com.example.locationapp.model.Role;
import com.example.locationapp.security.UserPrincipal;
import com.example.locationapp.service.EventService;
import com.example.locationapp.dto.CancelEventRequest;
import com.example.locationapp.dto.EventSummaryDto;
import com.example.locationapp.model.User;
import com.example.locationapp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final UserRepository userRepository;

    public EventController(EventService eventService, UserRepository userRepository) {
        this.eventService = eventService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createEvent(
            @RequestBody Event event,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal.getRole() != Role.HOST && principal.getRole() != Role.HOST_PREMIUM) {
            return ResponseEntity.status(403).body("Only hosts can create events");
        }
        boolean isPremium = principal.getRole() == Role.HOST_PREMIUM; 
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

    @PostMapping("/{eventId}/request")
    public ResponseEntity<?> requestJoin(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            EventMember member = eventService.requestJoin(eventId, principal.getUserId());
            return ResponseEntity.ok(member);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{eventId}/approve/{userId}")
    public ResponseEntity<?> approve(
            @PathVariable Long eventId,
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            return ResponseEntity.ok(eventService.approveRequest(eventId, userId, principal.getUserId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{eventId}/decline/{userId}")
    public ResponseEntity<?> decline(
            @PathVariable Long eventId,
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            return ResponseEntity.ok(eventService.declineRequest(eventId, userId, principal.getUserId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{eventId}/remove/{userId}")
    public ResponseEntity<?> removeMember(
            @PathVariable Long eventId,
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            eventService.removeMember(eventId, userId, principal.getUserId());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{eventId}/pending")
    public ResponseEntity<List<EventMember>> pending(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(eventService.getPendingRequests(eventId));
    }

    @GetMapping("/{eventId}/member-status")
    public ResponseEntity<String> memberStatus(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        EventMember.Status status = eventService.getMemberStatus(eventId, principal.getUserId());
        return ResponseEntity.ok(status != null ? status.name() : "NONE");
    }

    @PostMapping("/{eventId}/cancel")
    public ResponseEntity<?> cancelEvent(
            @PathVariable Long eventId,
            @RequestBody(required = false) CancelEventRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        try {
            String reason = request != null ? request.getReason() : null;
            boolean isAdmin = principal.getRole() == Role.ADMIN;
            eventService.cancelEvent(eventId, principal.getUserId(), reason, isAdmin);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

   
    @PostMapping("/{eventId}/approve-cancel")
    public ResponseEntity<?> approveCancel(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal principal) {
        try {
            if (principal.getRole() != Role.ADMIN) {
                return ResponseEntity.status(403).body("Only admin can approve cancellation");
            }
            eventService.approveCancellation(eventId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

  
    @PostMapping("/{eventId}/reject-cancel")
    public ResponseEntity<?> rejectCancel(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal principal) {
        try {
            if (principal.getRole() != Role.ADMIN) {
                return ResponseEntity.status(403).body("Only admin can reject cancellation");
            }
            eventService.rejectCancellation(eventId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{eventId}/complete")
    public ResponseEntity<?> completeEvent(
        @PathVariable Long eventId, 
        @AuthenticationPrincipal UserPrincipal principal){
            try{
                eventService.completeEvent(eventId, principal.getUserId());
                return ResponseEntity.ok().build();
            }catch(RuntimeException e){
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }


    @GetMapping("/{eventId}")
    public ResponseEntity<?> getEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.getEventById(eventId));
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<?> updateEvent(
            @PathVariable Long eventId,
            @RequestBody Event updated,
            @AuthenticationPrincipal UserPrincipal principal) {
        try {
            boolean isPremium = principal.getRole() == Role.HOST_PREMIUM;
            Event event = eventService.updateEvent(eventId, updated, principal.getUserId(), isPremium);
            return ResponseEntity.ok(event);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}