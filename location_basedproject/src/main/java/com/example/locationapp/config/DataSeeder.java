package com.example.locationapp.config;

import com.example.locationapp.model.Location;
import com.example.locationapp.repository.LocationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final LocationRepository locationRepository;

    public DataSeeder(LocationRepository locationRepository){
        this.locationRepository = locationRepository;
    }

    @Override 
    public void run(String... args){
        if (locationRepository.count() > 0) return;

        locationRepository.save(new Location("Central Cafe", "Cafe", 53.3811, -1.4701, "Coffee and snacks"));
        locationRepository.save(new Location("City Park", "Park", 53.3830, -1.4650, "Nice park to walk"));
        locationRepository.save(new Location("Fusion Restaurant", "Restaurant", 53.3795, -1.4720, "Dinner place"));
    }
}