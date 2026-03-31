package com.example.locationapp.service;

import com.example.locationapp.model.HostRequest;
import com.example.locationapp.model.Role;
import com.example.locationapp.model.User;
import com.example.locationapp.repository.HostRequestRepository;
import com.example.locationapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class HostRequestService {

    private final HostRequestRepository hostRequestRepo;
    private final UserRepository userRepo;

    public HostRequestService(HostRequestRepository hostRequestRepo,
                              UserRepository userRepo) {
        this.hostRequestRepo = hostRequestRepo;
        this.userRepo = userRepo;
    }

    // ✅ User submits a host request
    public HostRequest submitRequest(Long userId, String reason) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.HOST) {
            throw new RuntimeException("You are already a host");
        }

        if (hostRequestRepo.existsByUserIdAndStatus(userId, HostRequest.Status.PENDING)) {
            throw new RuntimeException("You already have a pending request");
        }

        return hostRequestRepo.save(new HostRequest(user, reason));
    }

    // ✅ Get the logged-in user's own requests
    public List<HostRequest> getMyRequests(Long userId) {
        return hostRequestRepo.findByUserId(userId);
    }

    // ✅ Admin: get all pending requests
    public List<HostRequest> getPendingRequests() {
        return hostRequestRepo.findByStatus(HostRequest.Status.PENDING);
    }

    // ✅ Admin: get all requests
    public List<HostRequest> getAllRequests() {
        return hostRequestRepo.findAll();
    }

    // ✅ Admin: approve
    public HostRequest approve(Long requestId) {
        HostRequest request = hostRequestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(HostRequest.Status.APPROVED);
        request.setReviewedAt(Instant.now());
        hostRequestRepo.save(request);

        // ✅ Upgrade the user's role to HOST
        User user = request.getUser();
        user.setRole(Role.HOST);
        userRepo.save(user);

        return request;
    }

    // ✅ Admin: reject
    public HostRequest reject(Long requestId) {
        HostRequest request = hostRequestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(HostRequest.Status.REJECTED);
        request.setReviewedAt(Instant.now());
        return hostRequestRepo.save(request);
    }
}