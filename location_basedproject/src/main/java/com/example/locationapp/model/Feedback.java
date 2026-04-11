package com.example.locationapp.model;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "feedback", uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_id"}))
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "event_id")
    private Long eventId;

    @Column(name = " user_id")
    private Long userId;

    private int rating;
    private String comment;
    private Instant createdAt = Instant.now();

    public Feedback(){}

    public Feedback(Long eventId, Long userId, int rating, String comment){
        this.eventId = eventId; 
        this.userId = userId;
        this.rating = rating;
        this.comment = comment;
    }

    public Long getId() {return id;}
    public Long getEventId(){return eventId; }
    public void setEventId(Long eventId) {this.eventId = eventId;}
    public Long getUserId(){return userId;}
    public void setUserId(Long userId) {this.userId = userId;}
    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Instant getCreatedAt() { return createdAt; }
}
