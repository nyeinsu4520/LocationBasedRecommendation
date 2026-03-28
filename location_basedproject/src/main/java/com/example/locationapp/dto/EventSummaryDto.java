package com.example.locationapp.dto;

import java.time.Instant;

public class EventSummaryDto {

    private Long id;
    private String title;
    private String description;
    private String locationName;
    private String address;
    private Double latitude;
    private Double longitude;
    private Instant eventDate;
    private int maxAttendees;
    private int attendeeCount;   
    private int spotsLeft;    
    private Long hostId;
    private String status;

    public EventSummaryDto(Long id, String title, String description,
                           String locationName, String address,
                           Double latitude, Double longitude,
                           Instant eventDate, int maxAttendees,
                           int attendeeCount, Long hostId, String status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.locationName = locationName;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.eventDate = eventDate;
        this.maxAttendees = maxAttendees;
        this.attendeeCount = attendeeCount;
        this.spotsLeft = maxAttendees - attendeeCount; 
        this.hostId = hostId;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getLocationName() { return locationName; }
    public String getAddress() { return address; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public Instant getEventDate() { return eventDate; }
    public int getMaxAttendees() { return maxAttendees; }
    public int getAttendeeCount() { return attendeeCount; }
    public int getSpotsLeft() { return spotsLeft; }
    public Long getHostId() { return hostId; }
    public String getStatus() { return status; }
}