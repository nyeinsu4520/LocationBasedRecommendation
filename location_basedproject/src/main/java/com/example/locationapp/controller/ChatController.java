package com.example.locationapp.controller;

import com.example.locationapp.dto.JoinMessage;
import com.example.locationapp.service.ChatService;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/chat")
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    @GetMapping("/{locationId}")
    public List<JoinMessage> getMessages(@PathVariable Long locationId) {
        return chatService.getMessagesByLocation(locationId);
    }

    @MessageMapping("/locations/{locationId}/chat")
    public void sendMessage(@DestinationVariable Long locationId, @Payload JoinMessage incoming) {

        if (!chatService.isUserInLocation(incoming.getUserId(), locationId)) {
            throw new RuntimeException("User not in this location");
        }

        incoming.setLocationId(locationId);
        incoming.setTimestamp(Instant.now());
        JoinMessage saved = chatService.saveIncoming(incoming);
        messagingTemplate.convertAndSend("/topic/locations/" + locationId, saved);
    }
}