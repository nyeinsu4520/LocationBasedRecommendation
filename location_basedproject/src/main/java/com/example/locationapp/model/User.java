package com.example.locationapp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    public enum Status{ACTIVE, BANNED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String name;

    @Column(nullable=false, unique=true)
    private String email;

    @Column(nullable=false)
    private String passwordHash;

    @Column(nullable=false)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "email_verified")
    private boolean emailVerified = false;

    public User() {}

    public User(String email, String passwordHash, String name, String phoneNumber, Role role) {
    this.email = email;
    this.passwordHash = passwordHash;
    this.name = name;
    this.phoneNumber = phoneNumber;
    this.role = role;
    this.status = Status.ACTIVE;
    }

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Status getStatus() {return status;}
    public void setStatus(Status status) {this.status = status;}

    public String getVerificationToken() { return verificationToken; }
    public void setVerificationToken(String verificationToken) { this.verificationToken = verificationToken; }
    
    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

}