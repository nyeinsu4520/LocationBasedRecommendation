package com.example.locationapp.service;

import com.example.locationapp.dto.JoinMessage;
import com.example.locationapp.model.ChatMessage;
import com.example.locationapp.model.Event;
import com.example.locationapp.repository.ChatMessageRepository;
import com.example.locationapp.repository.EventRepository;
import com.example.locationapp.repository.EventMemberRepository;
import com.example.locationapp.model.EventMember.Status;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ChatService {

    private final ChatMessageRepository chatRepo;
    private final EventRepository eventRepo;
    private final EventMemberRepository eventMemberRepo;

    public ChatService(ChatMessageRepository chatRepo,
                       EventRepository eventRepo,
                       EventMemberRepository eventMemberRepo) {
        this.chatRepo = chatRepo;
        this.eventRepo = eventRepo;
        this.eventMemberRepo = eventMemberRepo;
    }

    public JoinMessage saveIncoming(JoinMessage msg) {
        if (msg.getTimestamp() == null) msg.setTimestamp(Instant.now());

        Event event = eventRepo.findById(msg.getLocationId())
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + msg.getLocationId()));

        ChatMessage saved = chatRepo.save(
                new ChatMessage(msg.getUserId(), msg.getUsername(), event, msg.getContent())
        );

        JoinMessage out = new JoinMessage();
        out.setLocationId(event.getId());
        out.setUserId(saved.getUserId());
        out.setUsername(saved.getUsername());
        out.setContent(saved.getContent());
        out.setTimestamp(saved.getCreatedAt());
        return out;
    }

    public List<ChatMessage> getRecentMessages(Long eventId) {
        return chatRepo.findTop50ByEventIdOrderByCreatedAtDesc(eventId);
    }


    public boolean isUserInEvent(Long userId, Long eventId) {
        return eventMemberRepo.existsByUserIdAndEventId(userId, eventId);
    }

    public List<JoinMessage> getMessagesByEvent(Long eventId) {
        List<ChatMessage> messages = chatRepo.findByEventIdOrderByCreatedAtAsc(eventId);

        return messages.stream().map(msg -> {
            JoinMessage jm = new JoinMessage();
            jm.setLocationId(msg.getEvent().getId()); 
            jm.setUserId(msg.getUserId());
            jm.setUsername(msg.getUsername());
            jm.setContent(msg.getContent());
            jm.setTimestamp(msg.getCreatedAt());
            return jm;
        }).toList();
    }
}