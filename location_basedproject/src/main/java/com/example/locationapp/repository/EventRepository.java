package com.example.locationapp.repository;

import com.example.locationapp.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByHostId(Long hostId);

    List<Event> findByStatus(Event.Status status);

    @Query("""
        SELECT e FROM Event e
        WHERE e.status = 'ACTIVE'
        AND e.latitude BETWEEN :minLat AND :maxLat
        AND e.longitude BETWEEN :minLng AND :maxLng
    """)
    List<Event> findNearby(
        @Param("minLat") double minLat,
        @Param("maxLat") double maxLat,
        @Param("minLng") double minLng,
        @Param("maxLng") double maxLng
    );
}