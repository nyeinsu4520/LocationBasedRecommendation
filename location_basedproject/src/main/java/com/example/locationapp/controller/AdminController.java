package com.example.locationapp.controller;

import com.example.locationapp.model.HostRequest;
import com.example.locationapp.model.User;
import com.example.locationapp.security.UserPrincipal;
import com.example.locationapp.service.AdminService;
import com.example.locationapp.service.HostRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.locationapp.service.EventService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final HostRequestService hostRequestService;
    private final AdminService adminService;
    private final EventService eventService;

    public AdminController(HostRequestService hostRequestService,
                           AdminService adminService, EventService eventService) {
        this.hostRequestService = hostRequestService;
        this.adminService = adminService;
        this.eventService = eventService;
    }

    // ✅ All pending host requests
    @GetMapping("/host-requests/pending")
    public ResponseEntity<List<HostRequest>> pending() {
        return ResponseEntity.ok(hostRequestService.getPendingRequests());
    }

    // ✅ All host requests
    @GetMapping("/host-requests")
    public ResponseEntity<List<HostRequest>> all() {
        return ResponseEntity.ok(hostRequestService.getAllRequests());
    }

    // ✅ Approve
    @PostMapping("/host-requests/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(hostRequestService.approve(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ Reject
    @PostMapping("/host-requests/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(hostRequestService.reject(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ All users
    @GetMapping("/users")
    public ResponseEntity<List<User>> users() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // ✅ Ban user
    @PostMapping("/users/{id}/ban")
    public ResponseEntity<?> ban(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.banUser(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ Unban user
    @PostMapping("/users/{id}/unban")
    public ResponseEntity<?> unban(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.unbanUser(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ Demote HOST to USER
    @PostMapping("/users/{id}/demote")
    public ResponseEntity<?> demote(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.demoteUser(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/events")
    public ResponseEntity<?> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/cancel-requests")
public ResponseEntity<?> getCancelRequests() {
    return ResponseEntity.ok(eventService.getCancelRequests());
}

@PostMapping("/events/{eventId}/approve-cancel")
public ResponseEntity<?> approveCancel(@PathVariable Long eventId) {
    try {
        eventService.approveCancellation(eventId);
        return ResponseEntity.ok().build();
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}

@PostMapping("/events/{eventId}/reject-cancel")
public ResponseEntity<?> rejectCancel(@PathVariable Long eventId) {
    try {
        eventService.rejectCancellation(eventId);
        return ResponseEntity.ok().build();
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
}