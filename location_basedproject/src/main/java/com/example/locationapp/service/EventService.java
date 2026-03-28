package com.example.locationapp.service;

import com.example.locationapp.dto.EventSummaryDto;
import com.example.locationapp.model.Event;
import com.example.locationapp.model.EventMember;
import com.example.locationapp.model.Role;
import com.example.locationapp.repository.EventMemberRepository;
import com.example.locationapp.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventMemberRepository eventMemberRepository;

    public EventService(EventRepository eventRepository,
                        EventMemberRepository eventMemberRepository) {
        this.eventRepository = eventRepository;
        this.eventMemberRepository = eventMemberRepository;
    }


    public Event createEvent(Event event, Long hostId, boolean isPremiumHost) {
        event.setHostId(hostId);

        if (!isPremiumHost && event.getMaxAttendees() > 10) {
            event.setMaxAttendees(10);
        }

        return eventRepository.save(event);
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

    public void leaveEvent(Long eventId, Long userId) {
        EventMember member = eventMemberRepository
                .findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member"));
        member.setStatus(EventMember.Status.LEFT);
        eventMemberRepository.save(member);
    }

    public List<EventMember> getJoinedEvents(Long userId) {
        return eventMemberRepository.findByUserId(userId);
    }

    public List<EventSummaryDto> getNearbyEvents(double lat, double lng, double radiusKm) {
        double delta = radiusKm / 111.0;
        List<Event> events = eventRepository.findNearby(
                lat - delta, lat + delta,
                lng - delta, lng + delta
        );
        return events.stream().map(event -> {
            int count = eventMemberRepository.countByEventIdAndStatus(event.getId(),EventMember.Status.ACTIVE);
            return new EventSummaryDto(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getLocationName(),
                event.getAddress(),
                event.getLatitude(),
                event.getLongitude(),
                event.getEventDate(),
                event.getMaxAttendees(),
                count,
                event.getHostId(),
                event.getStatus().name());
        }).toList();
    }

    public List<EventSummaryDto> getHostEvents(Long hostId) {
        List<Event> events = eventRepository.findByHostId(hostId);

        return events.stream().map(event -> {
            int count = eventMemberRepository.countByEventIdAndStatus(
                    event.getId(), EventMember.Status.ACTIVE
            );
            return new EventSummaryDto(
                    event.getId(),
                    event.getTitle(),
                    event.getDescription(),
                    event.getLocationName(),
                    event.getAddress(),
                    event.getLatitude(),
                    event.getLongitude(),
                    event.getEventDate(),
                    event.getMaxAttendees(),
                    count,
                    event.getHostId(),
                    event.getStatus().name()
            );
        }).toList();
    }

    public List<EventMember> getAttendees(Long eventId) {
        return eventMemberRepository.findByEventId(eventId);
    }
}