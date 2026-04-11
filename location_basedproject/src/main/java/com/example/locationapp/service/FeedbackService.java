package com.example.locationapp.service;

import com.example.locationapp.model.Event;
import com.example.locationapp.model.EventMember;
import com.example.locationapp.model.Feedback;
import com.example.locationapp.repository.EventMemberRepository;
import com.example.locationapp.repository.EventRepository;
import com.example.locationapp.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final EventRepository eventRepository;
    private final EventMemberRepository eventMemberRepository;

    public FeedbackService(FeedbackRepository feedbackRepository,
                           EventRepository eventRepository,
                           EventMemberRepository eventMemberRepository) {
        this.feedbackRepository = feedbackRepository;
        this.eventRepository = eventRepository;
        this.eventMemberRepository = eventMemberRepository;
    }

    public Feedback submitFeedback(Long eventId, Long userId, int rating, String comment) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

       
        if (event.getStatus() != Event.Status.COMPLETED) {
            throw new RuntimeException("Feedback can only be submitted for completed events");
        }

        
        boolean wasMember = eventMemberRepository
                .findByEventIdAndUserId(eventId, userId)
                .map(m -> m.getStatus() == EventMember.Status.ACTIVE
                        || m.getStatus() == EventMember.Status.LEFT)
                .orElse(false);

        if (!wasMember) {
            throw new RuntimeException("Only event members can submit feedback");
        }

        if (feedbackRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new RuntimeException("You have already submitted feedback for this event");
        }

        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        return feedbackRepository.save(new Feedback(eventId, userId, rating, comment));
    }

    public List<Feedback> getEventFeedback(Long eventId) {
        return feedbackRepository.findByEventId(eventId);
    }

    public double getAverageRating(Long eventId) {
        List<Feedback> feedbacks = feedbackRepository.findByEventId(eventId);
        if (feedbacks.isEmpty()) return 0.0;
        return feedbacks.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);
    }
}