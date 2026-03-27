package com.example.locationapp.controller;
import com.example.locationapp.model.Location;
import com.example.locationapp.service.LocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "http://localhost:5173")

public class LocationController {
    private final LocationService locationService;
    public LocationController(LocationService locationService){
        this.locationService = locationService;
    }

    @GetMapping
    public ResponseEntity<List<Location>> getAll(){
        return ResponseEntity.ok(locationService.getAllLocations());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Location>> getByCategory(@PathVariable String category){
        return ResponseEntity.ok(locationService.getLocationsByCategory(category));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Location>> nearby(
        @RequestParam double lat,
        @RequestParam double lng,
        @RequestParam double radiusKm
    ){
        return ResponseEntity.ok(locationService.getLocationsNearby(lat, lng, radiusKm));
    }

    @PostMapping("/save")
    public Location saveLocation(@RequestBody Location location) {
        Location existing = locationService.findByNameAndCoordinates(
                location.getName(), location.getLatitude(), location.getLongitude()
        );

        if (existing != null) {
            return existing; 
        }

        return locationService.save(location); 
    }


}
