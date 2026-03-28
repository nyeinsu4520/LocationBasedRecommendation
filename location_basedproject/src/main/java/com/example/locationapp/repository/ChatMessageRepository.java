package com.example.locationapp.repository;

import com.example.locationapp.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE m.event.id = :eventId ORDER BY m.createdAt DESC LIMIT 50")
    List<ChatMessage> findTop50ByEventIdOrderByCreatedAtDesc(@Param("eventId") Long eventId);

    @Query("SELECT m FROM ChatMessage m WHERE m.event.id = :eventId ORDER BY m.createdAt ASC")
    List<ChatMessage> findByEventIdOrderByCreatedAtAsc(@Param("eventId") Long eventId);
}