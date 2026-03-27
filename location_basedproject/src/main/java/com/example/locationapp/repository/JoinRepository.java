package com.example.locationapp.repository;

import com.example.locationapp.model.JoinEvent;
import com.example.locationapp.model.JoinEvent.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JoinRepository extends JpaRepository<JoinEvent, Long> {

    List<JoinEvent> findByLocationIdAndStatus(Long locationId, Status status);
    Optional<JoinEvent> findFirstByUserIdAndLocationIdAndStatus(Long userId, Long locationId, Status status);
    boolean existsByUserIdAndLocationId(Long userId, Long locationId);
    boolean existsByUserIdAndLocationIdAndStatus(Long userId, Long locationId, Status status);
    List<JoinEvent> findByUserIdAndStatus(Long userId, Status status);
}