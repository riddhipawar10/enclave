
package com.enclave.notification.controller;

import com.enclave.auth.entity.User;
import com.enclave.notification.dto.CreateNotificationRequest;
import com.enclave.notification.dto.NotificationResponse;
import com.enclave.notification.service.NotificationService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
     * Get notifications for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            Authentication authentication
    ) {
        UUID userId = getAuthenticatedUserId(authentication);

        return ResponseEntity.ok(
                notificationService.getNotifications(userId)
        );
    }

    /**
     * Get unread notification count for the authenticated user.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            Authentication authentication
    ) {
        UUID userId = getAuthenticatedUserId(authentication);

        return ResponseEntity.ok(
                notificationService.getUnreadCount(userId)
        );
    }

    /**
     * Create a notification.
     * Existing task services use this service directly.
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
     * Mark one of the authenticated user's notifications as read.
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID notificationId,
            Authentication authentication
    ) {
        UUID userId = getAuthenticatedUserId(authentication);

        notificationService.markAsRead(
                userId,
                notificationId
        );

        return ResponseEntity.noContent().build();
    }

    /**
     * Mark all of the authenticated user's notifications as read.
     */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            Authentication authentication
    ) {
        UUID userId = getAuthenticatedUserId(authentication);

        notificationService.markAllAsRead(userId);

        return ResponseEntity.noContent().build();
    }

    private UUID getAuthenticatedUserId(
            Authentication authentication
    ) {
        if (authentication == null
                || !(authentication.getPrincipal() instanceof User user)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Authenticated user not found"
            );
        }

        return user.getId();
    }
}
