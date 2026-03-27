package com.example.locationapp.repository;

import com.example.locationapp.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location,Long> {

    List<Location> findByCategory(String category);
    Location findByNameAndLatitudeAndLongitude(String name, double latitude, double longitude);
}
