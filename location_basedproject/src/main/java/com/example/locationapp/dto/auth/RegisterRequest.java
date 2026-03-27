package com.example.locationapp.dto.auth;

public class RegisterRequest {

    private String name;
    private String email;
    private String password;
    private String phoneNumber;

    public RegisterRequest() {}

    public RegisterRequest(String name, String email, String password, String phoneNumber){
        this.name = name;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhoneNumber() {return phoneNumber;}
    public void setPhontNumber(String phoneNumber) {this.phoneNumber = phoneNumber;}
    
}