package com.enclave.notification.controller;

import com.enclave.notification.dto.CreateNotificationRequest;
import com.enclave.notification.dto.NotificationResponse;
import com.enclave.notification.service.NotificationService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService
    ) {
        this.notificationService = notificationService;
    }

    /**
     * Get all notifications for a user.
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @RequestParam UUID userId
    ) {
        return ResponseEntity.ok(
                notificationService.getNotifications(userId)
        );
    }

    /**
     * Get unread notification count for a user.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            @RequestParam UUID userId
    ) {
        return ResponseEntity.ok(
                notificationService.getUnreadCount(userId)
        );
    }

    /**
     * Create a notification.
     */
    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(
            @Valid @RequestBody CreateNotificationRequest request
    ) {
        return ResponseEntity.ok(
                notificationService.createNotification(request)
        );
    }

    /**
     * Mark one notification as read.
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID notificationId,
            @RequestParam UUID userId
    ) {
        notificationService.markAsRead(
                userId,
                notificationId
        );

        return ResponseEntity.noContent().build();
    }

    /**
     * Mark all notifications as read.
     */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestParam UUID userId
    ) {
        notificationService.markAllAsRead(userId);

        return ResponseEntity.noContent().build();
    }
}