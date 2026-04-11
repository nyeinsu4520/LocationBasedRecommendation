package com.example.locationapp.service;

import com.example.locationapp.dto.EventSummaryDto;
import com.example.locationapp.model.Event;
import com.example.locationapp.model.EventMember;
import com.example.locationapp.repository.EventMemberRepository;
import com.example.locationapp.repository.EventRepository;
import com.example.locationapp.service.NotificationService;
import com.example.locationapp.model.Notification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventMemberRepository eventMemberRepository;
    private final NotificationService notificationService;

    public EventService(EventRepository eventRepository,
                        EventMemberRepository eventMemberRepository,
                    NotificationService notificationService) {
        this.eventRepository = eventRepository;
        this.eventMemberRepository = eventMemberRepository;
        this.notificationService = notificationService;

    }

    public Event createEvent(Event event, Long hostId, boolean isPremiumHost) {
        event.setHostId(hostId);
        if (!isPremiumHost && event.getMaxAttendees() > 10) {
            event.setMaxAttendees(10);
        }
        Event saved = eventRepository.save(event);
        // ✅ Auto-join host as active member
        eventMemberRepository.save(new EventMember(saved, hostId));
        return saved;
    }

    public EventMember joinEvent(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (event.getStatus() != Event.Status.ACTIVE) {
            throw new RuntimeException("Event is not active");
        }
        eventMemberRepository.findByEventIdAndUserId(eventId, userId)
                .ifPresent(m -> { throw new RuntimeException("Already joined"); });
        int currentCount = eventMemberRepository
                .countByEventIdAndStatus(eventId, EventMember.Status.ACTIVE);
        if (currentCount >= event.getMaxAttendees()) {
            throw new RuntimeException("Event is full");
        }
        return eventMemberRepository.save(new EventMember(event, userId));
    }

    public List<EventMember> getJoinedEvents(Long userId) {
        return eventMemberRepository.findByUserId(userId);
    }

    public boolean isMember(Long eventId, Long userId) {
        return eventMemberRepository.existsByUserIdAndEventIdAndStatus(
                userId, eventId, EventMember.Status.ACTIVE);
    }

    // ✅ Helper to build EventSummaryDto — avoids repetition
    private EventSummaryDto toDto(Event event, int count) {
        return new EventSummaryDto(
                event.getId(), event.getTitle(), event.getDescription(),
                event.getLocationName(), event.getAddress(),
                event.getLatitude(), event.getLongitude(),
                event.getEventDate(), event.getMaxAttendees(),
                count, event.getHostId(), event.getStatus().name(),
                event.getCancelReason() // ✅ always included
        );
    }

    public List<EventSummaryDto> getNearbyEvents(double lat, double lng, double radiusKm) {
        double delta = radiusKm / 111.0;
        List<Event> events = eventRepository.findNearby(
                lat - delta, lat + delta,
                lng - delta, lng + delta
        );
        return events.stream().map(event -> {
            int count = eventMemberRepository.countByEventIdAndStatus(
                    event.getId(), EventMember.Status.ACTIVE);
            return toDto(event, count); // ✅ use helper
        }).toList();
    }

    public List<EventSummaryDto> getHostEvents(Long hostId) {
        return eventRepository.findByHostId(hostId).stream().map(event -> {
            int count = eventMemberRepository.countByEventIdAndStatus(
                    event.getId(), EventMember.Status.ACTIVE);
            return toDto(event, count); // ✅ use helper
        }).toList();
    }

    public List<EventMember> getAttendees(Long eventId) {
        return eventMemberRepository.findByEventId(eventId);
    }

    public EventMember approveRequest(Long eventId, Long userId, Long hostId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found."));
        if (!event.getHostId().equals(hostId)) {
            throw new RuntimeException("Only the host can approve requests");
        }
        EventMember member = eventMemberRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        member.setStatus(EventMember.Status.ACTIVE);
        return eventMemberRepository.save(member);
    }

    public EventMember declineRequest(Long eventId, Long userId, Long hostId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (!event.getHostId().equals(hostId)) {
            throw new RuntimeException("Only the host can decline requests.");
        }
        EventMember member = eventMemberRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        member.setStatus(EventMember.Status.DECLINED);
        return eventMemberRepository.save(member);
    }

    public void removeMember(Long eventId, Long userId, Long hostId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (!event.getHostId().equals(hostId)) {
            throw new RuntimeException("Only the host can remove members");
        }
        EventMember member = eventMemberRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        member.setStatus(EventMember.Status.REMOVED);
        eventMemberRepository.save(member);
    }

    public List<EventMember> getPendingRequests(Long eventId) {
        return eventMemberRepository.findPendingByEventId(eventId);
    }

    public EventMember.Status getMemberStatus(Long eventId, Long userId) {
        return eventMemberRepository.findByEventIdAndUserId(eventId, userId)
                .map(EventMember::getStatus)
                .orElse(null);
    }

    public EventSummaryDto getEventById(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        int count = eventMemberRepository.countByEventIdAndStatus(
                eventId, EventMember.Status.ACTIVE);
        return toDto(event, count); 
    }

    public Event updateEvent(Long eventId, Event updated, Long hostId, boolean isPremium) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (!event.getHostId().equals(hostId)) {
            throw new RuntimeException("Only the host can edit this event");
        }
        int maxAllowed = isPremium ? 50 : 10;
        if (updated.getMaxAttendees() > maxAllowed) {
            throw new RuntimeException("Max attendees exceeded for your plan");
        }
        event.setTitle(updated.getTitle());
        event.setDescription(updated.getDescription());
        event.setEventDate(updated.getEventDate());
        event.setLocationName(updated.getLocationName());
        event.setAddress(updated.getAddress());
        event.setMaxAttendees(updated.getMaxAttendees());
        return eventRepository.save(event);
    }

    public EventMember requestJoin(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found."));
        if (event.getStatus() != Event.Status.ACTIVE) {
            throw new RuntimeException("Event is not active.");
        }
        eventMemberRepository.findByEventIdAndUserId(eventId, userId).ifPresent(m -> {
            if (m.getStatus() == EventMember.Status.PENDING)
                throw new RuntimeException("Already requested.");
            if (m.getStatus() == EventMember.Status.ACTIVE)
                throw new RuntimeException("Already joined");
        });
        int currentCount = eventMemberRepository.countByEventIdAndStatus(
                eventId, EventMember.Status.ACTIVE);
        if (currentCount >= event.getMaxAttendees()) {
            throw new RuntimeException("Event is full");
        }
        EventMember member = new EventMember(event, userId);
        member.setStatus(EventMember.Status.PENDING);
        EventMember saved = eventMemberRepository.save(member);
        notificationService.createNotification(
            event.getHostId(), eventId, event.getTitle(),
            "User #" + userId + " requested to join your event",
            Notification.Type.JOIN_REQUEST
        );

        return saved;
    }

    public void leaveEvent(Long eventId, Long userId) {
        EventMember member = eventMemberRepository
                .findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member"));
        if (member.getStatus() != EventMember.Status.ACTIVE) {
            throw new RuntimeException("Not an active member");
        }
        member.setStatus(EventMember.Status.LEFT);
        eventMemberRepository.save(member);

        Event event = eventRepository.findById(eventId).orElse(null);
        if (event != null) {
            notificationService.createNotification(
                event.getHostId(), eventId, event.getTitle(),
                "User #" + userId + " left your event",
                Notification.Type.USER_LEFT
            );
        }
    }

    public void approveCancellation(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (event.getStatus() != Event.Status.CANCEL_REQUESTED) {
            throw new RuntimeException("No cancellation request pending");
        }
        event.setStatus(Event.Status.CANCELLED);
        eventRepository.save(event);
    }

    public void rejectCancellation(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (event.getStatus() != Event.Status.CANCEL_REQUESTED) {
            throw new RuntimeException("No cancellation request pending");
        }
        event.setStatus(Event.Status.ACTIVE);
        event.setCancelReason(null);
        eventRepository.save(event);
    }

    public void cancelEvent(Long eventId, Long userId, String reason, boolean isAdmin) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getHostId().equals(userId) && !isAdmin) {
            throw new RuntimeException("Only the host can request cancellation");
        }

        if (event.getStatus() != Event.Status.ACTIVE) {
            throw new RuntimeException("Only active events can be cancelled");
        }

        event.setStatus(Event.Status.CANCEL_REQUESTED);
        event.setCancelReason(reason);
        eventRepository.save(event);
    }

    public List<EventSummaryDto> getCancelRequests() {
        return eventRepository.findByStatus(Event.Status.CANCEL_REQUESTED)
                .stream().map(event -> {
                    int count = eventMemberRepository.countByEventIdAndStatus(
                            event.getId(), EventMember.Status.ACTIVE);
                    return toDto(event, count); 
                }).toList();
    }

    public void completeEvent(Long eventId, Long userId){
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found."));
        if(!event.getHostId().equals(userId)){
            throw new RuntimeException("Only the host can complete this event.");
        }
        if(event.getStatus() != Event.Status.ACTIVE){
            throw new RuntimeException("Only active events can be completed");
        }
        event.setStatus(Event.Status.COMPLETED);
        eventRepository.save(event);
    }

    public List<EventSummaryDto> getAllEvents() {
        return eventRepository.findAll().stream().map(event -> {
            int count = eventMemberRepository.countByEventIdAndStatus(
                    event.getId(), EventMember.Status.ACTIVE);
            return toDto(event, count); 
        }).toList();
    }
}