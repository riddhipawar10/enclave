package com.enclave.notification.service;

import com.enclave.notification.dto.CreateNotificationRequest;
import com.enclave.notification.dto.NotificationResponse;
import com.enclave.notification.entity.Notification;
import com.enclave.notification.repository.NotificationRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository
    ) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(
            UUID userId
    ) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(
            UUID userId
    ) {
        return notificationRepository
                .countByUserIdAndReadFalse(userId);
    }

    public NotificationResponse createNotification(
            CreateNotificationRequest request
    ) {
    	Notification notification = Notification.builder()
    	        .userId(request.userId())
    	        .type(request.type())
    	        .title(request.title())
    	        .message(request.message())
    	        .referenceId(request.referenceId())
    	        .referenceType(request.referenceType())
    	        .projectId(request.projectId())
    	        .read(false)
    	        .createdAt(LocalDateTime.now())
    	        .build();

        Notification saved =
                notificationRepository.save(notification);

        return NotificationResponse.fromEntity(saved);
    }

    public void markAsRead(
            UUID userId,
            UUID notificationId
    ) {
        Notification notification =
                notificationRepository.findById(notificationId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Notification not found"
                                )
                        );

        if (!notification.getUserId().equals(userId)) {
            throw new IllegalArgumentException(
                    "Notification does not belong to this user"
            );
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    public void markAllAsRead(
            UUID userId
    ) {
        List<Notification> notifications =
                notificationRepository
                        .findByUserIdAndReadFalseOrderByCreatedAtDesc(
                                userId
                        );

        if (notifications.isEmpty()) {
            return;
        }

        notifications.forEach(notification ->
                notification.setRead(true)
        );

        notificationRepository.saveAll(notifications);
    }
}