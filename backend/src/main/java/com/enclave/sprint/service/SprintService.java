package com.enclave.sprint.service;

import com.enclave.sprint.entity.Sprint;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface SprintService {

    List<Sprint> getSprintsByProject(UUID organizationId, UUID projectId);

    Sprint getSprint(UUID organizationId, UUID projectId, UUID sprintId);

    Sprint createSprint(
            UUID organizationId,
            UUID projectId,
            UUID createdBy,
            String name,
            String goal,
            LocalDate startDate,
            LocalDate endDate
    );

    Sprint updateSprint(
            UUID organizationId,
            UUID projectId,
            UUID sprintId,
            String name,
            String goal,
            LocalDate startDate,
            LocalDate endDate,
            String status
    );

    void deleteSprint(
            UUID organizationId,
            UUID projectId,
            UUID sprintId
    );
}