package com.example.locationapp.controller;

import com.example.locationapp.model.HostRequest;
import com.example.locationapp.security.UserPrincipal;
import com.example.locationapp.service.HostRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/host-requests")
public class HostRequestController {

    private final HostRequestService hostRequestService;

    public HostRequestController(HostRequestService hostRequestService) {
        this.hostRequestService = hostRequestService;
    }

    // ✅ User submits a host request
    @PostMapping
    public ResponseEntity<?> submit(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        try {
            String reason = body.getOrDefault("reason", "");
            HostRequest request = hostRequestService.submitRequest(
                    principal.getUserId(), reason);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ User checks their own request status
    @GetMapping("/my")
    public ResponseEntity<List<HostRequest>> myRequests(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(
                hostRequestService.getMyRequests(principal.getUserId()));
    }
}