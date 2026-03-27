package com.example.locationapp.service;

import com.example.locationapp.model.Location;
import com.example.locationapp.repository.LocationRepository;
import com.example.locationapp.util.DistanceCalculator;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationService {
    
    private final LocationRepository locationRepository;

    public LocationService(LocationRepository locationRepository){
        this.locationRepository = locationRepository;
    }

    public List<Location> getAllLocations(){
        return locationRepository.findAll();
    }

    public List<Location> getLocationsByCategory(String category){
        return locationRepository.findByCategory(category);
    }

    public List<Location> getLocationsNearby(double userLat, double userLng, double radiusKm){
        List<Location> allLocations = locationRepository.findAll();

        return allLocations.stream().filter(loc -> DistanceCalculator.distance(userLat,userLng,loc.getLatitude(),loc.getLongitude()) <= radiusKm).collect(Collectors.toList());
    }

    public Location findByNameAndCoordinates(String name, double lat, double lon) {
        return locationRepository.findByNameAndLatitudeAndLongitude(name, lat, lon);
    }

    public Location save(Location loc) {
        return locationRepository.save(loc);
    }
}
