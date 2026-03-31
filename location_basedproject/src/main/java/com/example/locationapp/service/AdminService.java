package com.example.locationapp.service;

import com.example.locationapp.model.User;
import com.example.locationapp.model.Role;
import com.example.locationapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepo;

    public AdminService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    // ✅ All users
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    // ✅ Ban a user
    public User banUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(User.Status.BANNED);
        return userRepo.save(user);
    }

    // ✅ Unban a user
    public User unbanUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(User.Status.ACTIVE);
        return userRepo.save(user);
    }

    // ✅ Demote HOST back to USER
    public User demoteUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(Role.USER);
        return userRepo.save(user);
    }
}