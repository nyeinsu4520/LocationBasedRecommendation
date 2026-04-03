package com.example.locationapp.controller;

import com.example.locationapp.dto.auth.*;
import com.example.locationapp.service.AuthService;
import com.example.locationapp.model.User;
import com.example.locationapp.repository.UserRepository;
import com.example.locationapp.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, EmailService emailService, UserRepository userRepository) {
        this.authService = authService;
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        try {
            authService.register(req); // ✅ void — no AuthResponse
            return ResponseEntity.ok(Map.of(
                "message", "Registration successful! Please check your email to verify your account."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/verify")
public ResponseEntity<?> verifyEmail(@RequestParam String token) {
    try {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
        emailService.sendWelcomeEmail(user.getEmail(), user.getName());

        return ResponseEntity.status(302)
                .header("Location", "http://localhost:5173/login?verified=true")
                .build();

    } catch (RuntimeException e) {
        return ResponseEntity.status(302)
                .header("Location", "http://localhost:5173/login?error=invalid-token")
                .build();
    }
    }
}