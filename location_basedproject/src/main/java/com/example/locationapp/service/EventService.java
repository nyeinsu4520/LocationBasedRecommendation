package com.example.locationapp.service;

import com.example.locationapp.dto.EventSummaryDto;
import com.example.locationapp.model.Event;
import com.example.locationapp.model.EventMember;
import com.example.locationapp.model.Role;
import com.example.locationapp.repository.EventMemberRepository;
import com.example.locationapp.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.List;

import javax.management.RuntimeErrorException;

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

    public List<EventMember> getJoinedEvents(Long userId) {
        return eventMemberRepository.findByUserId(userId);
    }


    public boolean isMember(Long eventId, Long userId) {
        return eventMemberRepository.existsByUserIdAndEventIdAndStatus(
                userId, eventId, EventMember.Status.ACTIVE);
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

    public EventMember requestJoin(Long eventId,Long userId){
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found."));
        if(event.getStatus() != Event.Status.ACTIVE){
            throw new RuntimeException("Event is not active.");
        }
        eventMemberRepository.findByEventIdAndUserId(eventId, userId).ifPresent(m-> {
            if(m.getStatus() == EventMember.Status.PENDING){
                throw new RuntimeException("Already requested.");
            }
            if(m.getStatus()== EventMember.Status.ACTIVE){
                throw new RuntimeException("Already joined");
            }
        });
        int currentCount = eventMemberRepository.countByEventIdAndStatus(eventId, EventMember.Status.ACTIVE);
        if(currentCount >= event.getMaxAttendees()){
            throw new RuntimeException("Event is full");
        }

        EventMember member = new EventMember(event,userId);
        member.setStatus(EventMember.Status.PENDING);
        return eventMemberRepository.save(member);
    }

    public EventMember approveRequest(Long eventId, Long userId, Long hostId){
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found."));
        if(!event.getHostId().equals(hostId)){
            throw new RuntimeException("Only the host can approve requests");
        }
        
        EventMember member = eventMemberRepository.findByEventIdAndUserId(eventId, userId).orElseThrow(() -> new RuntimeException("Request not found"));
        member.setStatus(EventMember.Status.ACTIVE);
        return eventMemberRepository.save(member);
    }

    public EventMember declineRequest(Long eventId, Long userId, Long hostId){
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));

        if(!event.getHostId().equals(hostId)){
            throw new RuntimeException("Only the hose can decine requests.");
        }

        EventMember member = eventMemberRepository.findByEventIdAndUserId(eventId, userId).orElseThrow(()-> new RuntimeException("Request not found"));
        member.setStatus(EventMember.Status.DECLINED);
        return eventMemberRepository.save(member);
    }

    public void removeMember(Long eventId, Long userId, Long hostId){
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));

        if(!event.getHostId().equals(hostId)){
            throw new RuntimeException("Only the host can remove members");
        }

        EventMember member = eventMemberRepository.findByEventIdAndUserId(eventId, userId).orElseThrow(()-> new RuntimeException("Member not found"));
        member.setStatus(EventMember.Status.REMOVED);
        eventMemberRepository.save(member);
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
    }

    public List<EventMember> getPendingRequests(Long eventId) {
        return eventMemberRepository.findPendingByEventId(eventId);
    }

    public EventMember.Status getMemberStatus(Long eventId, Long userId) {
    return eventMemberRepository.findByEventIdAndUserId(eventId, userId)
            .map(EventMember::getStatus)
            .orElse(null);
    }

    public void cancelEvent(Long eventId, Long hostId) {
    Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
    if (!event.getHostId().equals(hostId)) {
        throw new RuntimeException("Only the host can cancel this event");
    }
    event.setStatus(Event.Status.CANCELLED);
    eventRepository.save(event);
    }

}