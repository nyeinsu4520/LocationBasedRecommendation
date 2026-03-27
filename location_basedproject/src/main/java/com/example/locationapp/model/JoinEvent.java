package com.example.locationapp.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "join_events")
public class JoinEvent {
    public enum Status {ACTIVE, OFFLINE}

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 

    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    private Instant joinedAt = Instant.now();
    private Instant leftAt;

    public JoinEvent(){}

    public JoinEvent(Long userId, Location location){
        this.userId = userId;
        this.location = location;
        this.status = Status.ACTIVE;
        this.joinedAt = Instant.now();
    }

    public Long getId() {return id; }

    public Long getUserId() {return userId;}
    public void setUserId(Long userId) {this.userId = userId; }

    public Location getLocation() {return location;}
    public void setLocation(Location location) {this.location = location;}

    public Status getStatus() {return status;}
    public void setStatus(Status status) {this.status = status;}

    public Instant getJoinedAt() {return joinedAt;}
    public void setJoinedAt(Instant joinedAt) {this.joinedAt = joinedAt;}

    public Instant getLeftAt() {return leftAt;}
    public void setLeftAt(Instant leftAt){this.leftAt = leftAt; }

}
