package com.example.locationapp.service;

import com.example.locationapp.model.Notification;
import com.example.locationapp.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void createNotification(Long userId, Long eventId, String eventTitle,
                                   String message, Notification.Type type) {
        if (userId == null) return;
        Notification notification = new Notification(userId, eventId, eventTitle, message, type);
        notificationRepository.save(notification);
        System.out.println("==> Notification saved for userId: " + userId + " type: " + type);
    }

    public List<Notification> getUnread(Long userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public void markAllRead(Long userId) {
        List<Notification> notifications = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }
}