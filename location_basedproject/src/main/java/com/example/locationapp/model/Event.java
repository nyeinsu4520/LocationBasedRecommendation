package com.example.locationapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "events")
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Event {
    
    public enum Status {ACTIVE,CANCELLED,COMPLETED}

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private String locationName;
    private Double latitude;
    private Double longitude;
    private String category;
    private String address;
    private Instant eventDate;
    private Instant createdAt = Instant.now();
    private int maxAttendees = 10;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;
    private Long hostId;
    

    public Event(){}

    public Long getId() {return id;}
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Instant getEventDate() { return eventDate; }
    public void setEventDate(Instant eventDate) { this.eventDate = eventDate; }

    public Instant getCreatedAt() { return createdAt; }

    public int getMaxAttendees() { return maxAttendees; }
    public void setMaxAttendees(int maxAttendees) { this.maxAttendees = maxAttendees; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Long getHostId() { return hostId; }
    public void setHostId(Long hostId) { this.hostId = hostId; }
}
