package com.example.locationapp.service;

import com.example.locationapp.model.JoinEvent;
import com.example.locationapp.model.JoinEvent.Status;
import com.example.locationapp.model.Location;
import com.example.locationapp.repository.JoinRepository;
import com.example.locationapp.repository.LocationRepository;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import static com.example.locationapp.model.JoinEvent.Status;

@Service
public class JoinService {
    
    private final JoinRepository joinRepository;
    private final LocationRepository locationRepository;

    public JoinService(JoinRepository joinRepository, LocationRepository locationRepository) {
        this.joinRepository = joinRepository;
        this.locationRepository = locationRepository;
    }

    public JoinEvent join(Long userId, Long locationId){
        Location location = locationRepository.findById(locationId).orElseThrow(() -> new IllegalArgumentException("Location not found: " + locationId )); 
        return joinRepository.findFirstByUserIdAndLocationIdAndStatus(userId, locationId, Status.ACTIVE).orElseGet(() -> joinRepository.save(new JoinEvent(userId, location)));
    }

    public List<JoinEvent> getJoinedLocations(Long userId) {
        return joinRepository.findByUserIdAndStatus(userId, JoinEvent.Status.ACTIVE);
    }

    public void leave(Long userId, Long locationId) {
        JoinEvent active = joinRepository.findFirstByUserIdAndLocationIdAndStatus(userId, locationId, Status.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("No active join to leave"));

        active.setStatus(Status.OFFLINE);
        active.setLeftAt(Instant.now());
        joinRepository.save(active);
    }

    public List<JoinEvent> getPresence(Long locationId) {
        return joinRepository.findByLocationIdAndStatus(locationId, Status.ACTIVE);
    }
}
