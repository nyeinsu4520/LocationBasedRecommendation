package com.example.locationapp.controller;

import com.example.locationapp.dto.JoinMessage;
import com.example.locationapp.service.ChatService;
import com.example.locationapp.service.NotificationService;
import com.example.locationapp.repository.EventRepository;
import com.example.locationapp.model.Event;
import com.example.locationapp.model.EventMember;
import com.example.locationapp.model.Notification;
import com.example.locationapp.repository.EventMemberRepository;
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
    private final NotificationService notificationService;
    private final EventRepository eventRepository;
    private final EventMemberRepository eventMemberRepository;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatService chatService,NotificationService notificationService,EventRepository eventRepository,EventMemberRepository eventMemberRepository){
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
        this.notificationService = notificationService;
        this.eventRepository = eventRepository;
        this.eventMemberRepository = eventMemberRepository;
    }

    @GetMapping("/{eventId}")
    public List<JoinMessage> getMessages(@PathVariable Long eventId) {
        return chatService.getMessagesByEvent(eventId);
    }

    @MessageMapping("/events/{eventId}/chat")
    public void sendMessage(
        @DestinationVariable Long eventId,
        @Payload JoinMessage incoming) {

    if (!chatService.isUserInEvent(incoming.getUserId(), eventId)) {
        throw new RuntimeException("User is not a member of this event");
    }

    incoming.setLocationId(eventId);
    incoming.setTimestamp(Instant.now());
    JoinMessage saved = chatService.saveIncoming(incoming);
    messagingTemplate.convertAndSend("/topic/events/" + eventId, saved);

    try {
        Event event = eventRepository.findById(eventId).orElse(null);
        if (event == null) return;

        boolean senderIsHost = event.getHostId().equals(incoming.getUserId());

        if (senderIsHost) {
            List<com.example.locationapp.model.EventMember> members =
                eventMemberRepository.findByEventIdAndStatus(
                    eventId, com.example.locationapp.model.EventMember.Status.ACTIVE);

            for (com.example.locationapp.model.EventMember member : members) {
                if (!member.getUserId().equals(incoming.getUserId())) {
                    notificationService.createNotification(
                        member.getUserId(), eventId, event.getTitle(),
                        "Host sent a new message in " + event.getTitle(),
                        Notification.Type.NEW_MESSAGE
                    );
                }
            }
        } else {
            notificationService.createNotification(
                event.getHostId(), eventId, event.getTitle(),
                "New message in your event chat from user #" + incoming.getUserId(),
                Notification.Type.NEW_MESSAGE
            );
        }
    } catch (Exception e) {
        System.out.println("==> Notification error: " + e.getMessage());
    }
    }
}