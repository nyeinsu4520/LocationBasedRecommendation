package com.example.locationapp.dto;

import java.time.Instant;

public class JoinMessage {
    private Long locationId;
    private Long userId;
    private String username;  
    private String content;
    private Instant timestamp;

    public JoinMessage() {}

    public JoinMessage(Long locationId, Long userId, String username, String content, Instant timestamp) {
        this.locationId = locationId;
        this.userId = userId;
        this.username = username;
        this.content = content;
        this.timestamp = timestamp;
    }

    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}