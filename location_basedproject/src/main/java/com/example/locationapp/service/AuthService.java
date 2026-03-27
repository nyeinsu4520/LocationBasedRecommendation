package com.example.locationapp.service;

import com.example.locationapp.dto.auth.*;
import com.example.locationapp.model.User;
import com.example.locationapp.repository.UserRepository;
import com.example.locationapp.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.locationapp.model.Role;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepo, PasswordEncoder encoder, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User(req.getEmail(), encoder.encode(req.getPassword()), req.getName(),req.getPhoneNumber(),Role.USER);
        user = userRepo.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), token);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email/password"));

        if (!encoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email/password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(),user.getRole().name());
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), token);
    }
}