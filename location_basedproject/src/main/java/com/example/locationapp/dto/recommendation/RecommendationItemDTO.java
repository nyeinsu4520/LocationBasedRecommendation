package com.example.locationapp.dto.recommendation;

import java.util.Map;

public class RecommendationItemDTO {

    private Long id;
    private String source;
    private String type;
    private String name;
    private double latitude;
    private double longitude;
    private Double distanceKm;
    private String address;
    private String website;
    private Map<String, String> tags;

    // ✅ New fields
    private String openingHours;
    private String phone;
    private String cuisine;
    private String email;

    public RecommendationItemDTO() {}

    public RecommendationItemDTO(String source, String type, String name,
                                 double latitude, double longitude,
                                 Double distanceKm, String address, String website,
                                 Map<String, String> tags,
                                 String openingHours, String phone,
                                 String cuisine, String email) {
        this.source = source;
        this.type = type;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.distanceKm = distanceKm;
        this.address = address;
        this.website = website;
        this.tags = tags;
        this.openingHours = openingHours;
        this.phone = phone;
        this.cuisine = cuisine;
        this.email = email;
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

    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}