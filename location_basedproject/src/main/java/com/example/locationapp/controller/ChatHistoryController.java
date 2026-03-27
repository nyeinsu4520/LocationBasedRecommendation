package com.example.locationapp.controller;

import com.example.locationapp.model.ChatMessage;
import com.example.locationapp.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatHistoryController {

    private final ChatService chatService;

    public ChatHistoryController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/{locationId}/messages")
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable Long locationId) {
        return ResponseEntity.ok(chatService.getRecentMessages(locationId));
    }
}