package com.example.locationapp.repository;

import com.example.locationapp.model.EventMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EventMemberRepository extends JpaRepository<EventMember, Long> {

    @Query("SELECT m FROM EventMember m WHERE m.event.id = :eventId AND m.status = :status")
    List<EventMember> findByEventIdAndStatus(@Param("eventId") Long eventId, @Param("status") EventMember.Status status);

    @Query("SELECT m FROM EventMember m WHERE m.event.id = :eventId AND m.status = 'PENDING'")
    List<EventMember> findPendingByEventId(@Param("eventId") Long eventId);

    @Query("SELECT m FROM EventMember m WHERE m.event.id = :eventId AND m.userId = :userId AND m.status = 'ACTIVE'")
    Optional<EventMember> findActiveByEventIdAndUserId(
            @Param("eventId") Long eventId,
            @Param("userId") Long userId);


    @Query("SELECT m FROM EventMember m WHERE m.event.id = :eventId AND m.userId = :userId")
    Optional<EventMember> findByEventIdAndUserId(@Param("eventId") Long eventId, @Param("userId") Long userId);

    @Query("SELECT COUNT(m) > 0 FROM EventMember m WHERE m.userId = :userId AND m.event.id = :eventId")
    boolean existsByUserIdAndEventId(@Param("userId") Long userId, @Param("eventId") Long eventId);

    @Query("SELECT COUNT(m) FROM EventMember m WHERE m.event.id = :eventId AND m.status = :status")
    int countByEventIdAndStatus(@Param("eventId") Long eventId, @Param("status") EventMember.Status status);

    List<EventMember> findByUserIdAndStatus(Long userId, EventMember.Status status);

    List<EventMember> findByUserId(Long userId);

    @Query("SELECT m FROM EventMember m WHERE m.event.id = :eventId")
    List<EventMember> findByEventId(@Param("eventId") Long eventId);

    boolean existsByUserIdAndEventIdAndStatus(Long userId, Long eventId, EventMember.Status status);
}