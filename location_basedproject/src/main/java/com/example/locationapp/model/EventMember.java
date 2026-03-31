package com.example.locationapp.model;

import jakarta.persistence.*;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "event_members",
    uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_id"}))
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EventMember {
    public enum Status {ACTIVE, LEFT}

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Event event;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    private Instant joinedAt = Instant.now();
    private Instant leftAt;

    public EventMember(){}

    public EventMember(Event event,Long userId){
        this.userId = userId;
        this.event = event;
        this.status = Status.ACTIVE;
        this.joinedAt = Instant.now();
    }

    public Long getId() {return id; }

    public Long getUserId() {return userId;}
    public void setUserId(Long userId) {this.userId = userId; }

    public Event getEvent() {return event;}
    public void setEvent(Event event) {this.event = event;}

    public Status getStatus() {return status;}
    public void setStatus(Status status) {this.status = status;}

    public Instant getJoinedAt() {return joinedAt;}
    public void setJoinedAt(Instant joinedAt) {this.joinedAt = joinedAt;}

    public Instant getLeftAt() {return leftAt;}
    public void setLeftAt(Instant leftAt){this.leftAt = leftAt; }

}
