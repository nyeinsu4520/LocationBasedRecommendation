package com.example.locationapp.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {

    public enum Type { JOIN_REQUEST, USER_LEFT, NEW_MESSAGE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; 
    private Long eventId;
    private String eventTitle;
    private String message;
    private boolean read = false;
    private Instant createdAt = Instant.now();

    @Enumerated(EnumType.STRING)
    private Type type;

    public Notification() {}

    public Notification(Long userId, Long eventId, String eventTitle, String message, Type type) {
        this.userId = userId;
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.message = message;
        this.type = type;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getEventId() { return eventId; }
    public String getEventTitle() { return eventTitle; }
    public String getMessage() { return message; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public Instant getCreatedAt() { return createdAt; }
    public Type getType() { return type; }
}