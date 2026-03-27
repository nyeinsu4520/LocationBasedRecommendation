package com.example.locationapp.dto.recommendation;

import java.util.Map;

public class RecommendationItemDTO {

    private Long id;           // <-- add this
    private String source;      // "overpass" or "opentripmap"
    private String type;        // "hotel", "restaurant", "attraction"
    private String name;
    private double latitude;
    private double longitude;
    private Double distanceKm;  // computed by backend
    private String address;     // optional
    private String website;     // optional
    private Map<String, String> tags; // optional extra fields

    public RecommendationItemDTO() {}

    public RecommendationItemDTO(String source, String type, String name,
                                 double latitude, double longitude,
                                 Double distanceKm, String address, String website,
                                 Map<String, String> tags) {
        this.source = source;
        this.type = type;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.distanceKm = distanceKm;
        this.address = address;
        this.website = website;
        this.tags = tags;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public Map<String, String> getTags() { return tags; }
    public void setTags(Map<String, String> tags) { this.tags = tags; }
}
