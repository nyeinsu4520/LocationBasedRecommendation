package com.example.locationapp.service;

import com.example.locationapp.dto.JoinMessage;
import com.example.locationapp.model.ChatMessage;
import com.example.locationapp.model.Location;
import com.example.locationapp.repository.ChatMessageRepository;
import com.example.locationapp.repository.LocationRepository;
import com.example.locationapp.repository.JoinRepository;
import org.springframework.stereotype.Service;
import com.example.locationapp.model.JoinEvent.Status;

import java.time.Instant;
import java.util.List;

@Service
public class ChatService {
    
    private final ChatMessageRepository chatRepo;
    private final LocationRepository locationRepo;
    private final JoinRepository joinRepo;

    public ChatService(ChatMessageRepository chatRepo, LocationRepository locationRepo,JoinRepository joinRepo)
    {
        this.chatRepo = chatRepo;
        this.locationRepo = locationRepo;
        this.joinRepo = joinRepo;
    }

    public JoinMessage saveIncoming(JoinMessage msg){
        if (msg.getTimestamp() == null) msg.setTimestamp(Instant.now());

        Location location = locationRepo.findById(msg.getLocationId())
                .orElseThrow(() -> new IllegalArgumentException("Location not found: " + msg.getLocationId()));

        ChatMessage saved = chatRepo.save(
                new ChatMessage(msg.getUserId(), msg.getUsername(), location, msg.getContent())
        );

        JoinMessage out = new JoinMessage();
        out.setLocationId(location.getId());
        out.setUserId(saved.getUserId());
        out.setUsername(saved.getUsername());
        out.setContent(saved.getContent());
        out.setTimestamp(saved.getCreatedAt());
        return out;

    }

    public List<ChatMessage> getRecentMessages(Long locationId) {
        return chatRepo.findTop50ByLocationIdOrderByCreatedAtDesc(locationId);
    }

    public boolean isUserInLocation(Long userId, Long locationId) {
        return joinRepo.existsByUserIdAndLocationIdAndStatus(userId, locationId, Status.ACTIVE);
    }

    public List<JoinMessage> getMessagesByLocation(Long locationId) {
    List<ChatMessage> messages = chatRepo.findByLocationIdOrderByCreatedAtAsc(locationId);

        return messages.stream().map(msg -> {
            JoinMessage jm = new JoinMessage();
            jm.setLocationId(msg.getLocation().getId());
            jm.setUserId(msg.getUserId());
            jm.setUsername(msg.getUsername());
            jm.setContent(msg.getContent());
            jm.setTimestamp(msg.getCreatedAt());
            return jm;
        }).toList();
    }


}
