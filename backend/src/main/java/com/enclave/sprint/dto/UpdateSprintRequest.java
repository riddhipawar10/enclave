package com.enclave.sprint.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateSprintRequest(

        @NotBlank(message = "Sprint name is required")
        @Size(max = 150, message = "Sprint name must not exceed 150 characters")
        String name,

        @Size(max = 500, message = "Sprint goal must not exceed 500 characters")
        String goal,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        @NotBlank(message = "Sprint status is required")
        String status
) {
}