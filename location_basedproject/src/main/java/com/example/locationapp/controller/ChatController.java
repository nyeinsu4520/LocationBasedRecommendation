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

    @GetMapping("/{eventId}")
    public List<JoinMessage> getMessages(@PathVariable Long eventId) {
        return chatService.getMessagesByEvent(eventId);
    }

    @MessageMapping("/events/{eventId}/chat")
    public void sendMessage(
            @DestinationVariable Long eventId,
            @Payload JoinMessage incoming
    ) {
        if (!chatService.isUserInEvent(incoming.getUserId(), eventId)) {
            throw new RuntimeException("User is not a member of this event");
        }

        incoming.setLocationId(eventId);
        incoming.setTimestamp(Instant.now());
        JoinMessage saved = chatService.saveIncoming(incoming);
        messagingTemplate.convertAndSend("/topic/events/" + eventId, saved);
    }
}