package com.example.locationapp.service;

import com.example.locationapp.dto.auth.*;
import com.example.locationapp.model.User;
import com.example.locationapp.model.Role;
import com.example.locationapp.repository.UserRepository;
import com.example.locationapp.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public AuthService(UserRepository userRepo, PasswordEncoder encoder,
                       JwtUtil jwtUtil, EmailService emailService) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    public void register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        String verificationToken = UUID.randomUUID().toString();

        User user = new User(
                req.getEmail(),
                encoder.encode(req.getPassword()),
                req.getName(),
                req.getPhoneNumber(),
                Role.USER
        );

        user.setVerificationToken(verificationToken);
        user.setEmailVerified(false);

        userRepo.save(user);

        System.out.println("==> Token generated: " + verificationToken);
        System.out.println("==> Sending email to: " + req.getEmail());

        emailService.sendVerificationEmail(req.getEmail(), req.getName(), verificationToken);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email/password"));

        if (!encoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email/password");
        }

        if (user.getStatus() == User.Status.BANNED) {
            throw new IllegalArgumentException("Your account has been banned.");
        }

        if (!user.isEmailVerified()) {
            throw new IllegalArgumentException("Please verify your email before logging in. Check your inbox.");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), token, user.getRole().name());
    }
}