package com.example.locationapp.repository;

import com.example.locationapp.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findTop50ByLocationIdOrderByCreatedAtDesc(Long locationId);
    List<ChatMessage> findByLocationIdOrderByCreatedAtAsc(Long locationId);
}