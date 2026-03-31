package com.example.locationapp.repository;

import com.example.locationapp.model.HostRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HostRequestRepository extends JpaRepository<HostRequest, Long> {
    List<HostRequest> findByStatus(HostRequest.Status status);
    Optional<HostRequest> findByUserIdAndStatus(Long userId, HostRequest.Status status);
    boolean existsByUserIdAndStatus(Long userId, HostRequest.Status status);
    List<HostRequest> findByUserId(Long userId);
}