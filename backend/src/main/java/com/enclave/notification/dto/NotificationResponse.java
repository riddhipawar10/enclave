package com.enclave.notification.dto;

import com.enclave.notification.entity.Notification;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(

        UUID id,

        String type,

        String title,

        String message,

        UUID referenceId,

        String referenceType,

        UUID projectId,

        boolean read,

        LocalDateTime createdAt
) {

    public static NotificationResponse fromEntity(
            Notification notification
    ) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getReferenceId(),
                notification.getReferenceType(),
                notification.getProjectId(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}