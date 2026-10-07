package com.enclave.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateNotificationRequest(

        @NotNull
        UUID userId,

        @NotBlank
        @Size(max = 50)
        String type,

        @NotBlank
        @Size(max = 200)
        String title,

        @NotBlank
        @Size(max = 500)
        String message,

        UUID referenceId,

        @Size(max = 50)
        String referenceType,

        UUID projectId
) {
}