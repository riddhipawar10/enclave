package com.enclave.sprint.service;

import com.enclave.project.entity.Project;
import com.enclave.project.repository.ProjectRepository;
import com.enclave.sprint.entity.Sprint;
import com.enclave.sprint.repository.SprintRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class SprintServiceImpl implements SprintService {

    private static final String STATUS_PLANNED = "PLANNED";
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_COMPLETED = "COMPLETED";
    private static final String STATUS_CANCELLED = "CANCELLED";

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;

    public SprintServiceImpl(
            SprintRepository sprintRepository,
            ProjectRepository projectRepository
    ) {
        this.sprintRepository = sprintRepository;
        this.projectRepository = projectRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Sprint> getSprintsByProject(
            UUID organizationId,
            UUID projectId
    ) {
        validateProjectBelongsToOrganization(
                organizationId,
                projectId
        );

        return sprintRepository
                .findByProjectIdOrderByStartDateDesc(projectId);
    }

    @Override
    @Transactional(readOnly = true)
    public Sprint getSprint(
            UUID organizationId,
            UUID projectId,
            UUID sprintId
    ) {
        validateProjectBelongsToOrganization(
                organizationId,
                projectId
        );

        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() ->
                        new RuntimeException("Sprint not found")
                );

        if (!sprint.getProjectId().equals(projectId)) {
            throw new RuntimeException(
                    "Sprint does not belong to this project"
            );
        }

        return sprint;
    }

    @Override
    public Sprint createSprint(
            UUID organizationId,
            UUID projectId,
            UUID createdBy,
            String name,
            String goal,
            LocalDate startDate,
            LocalDate endDate
    ) {
        validateProjectBelongsToOrganization(
                organizationId,
                projectId
        );

        validateDates(startDate, endDate);

        Sprint sprint = Sprint.builder()
                .projectId(projectId)
                .name(name.trim())
                .goal(normalizeGoal(goal))
                .startDate(startDate)
                .endDate(endDate)
                .status(STATUS_PLANNED)
                .createdBy(createdBy)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return sprintRepository.save(sprint);
    }

    @Override
    public Sprint updateSprint(
            UUID organizationId,
            UUID projectId,
            UUID sprintId,
            String name,
            String goal,
            LocalDate startDate,
            LocalDate endDate,
            String status
    ) {
        Sprint sprint = getSprint(
                organizationId,
                projectId,
                sprintId
        );

        validateDates(startDate, endDate);
        validateStatus(status);

        sprint.setName(name.trim());
        sprint.setGoal(normalizeGoal(goal));
        sprint.setStartDate(startDate);
        sprint.setEndDate(endDate);
        sprint.setStatus(status.trim().toUpperCase());
        sprint.setUpdatedAt(LocalDateTime.now());

        return sprintRepository.save(sprint);
    }

    @Override
    public void deleteSprint(
            UUID organizationId,
            UUID projectId,
            UUID sprintId
    ) {
        Sprint sprint = getSprint(
                organizationId,
                projectId,
                sprintId
        );

        sprintRepository.delete(sprint);
    }

    private Project validateProjectBelongsToOrganization(
            UUID organizationId,
            UUID projectId
    ) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found")
                );

        if (!project.getOrganizationId().equals(organizationId)) {
            throw new RuntimeException(
                    "Project does not belong to this organization"
            );
        }

        if (project.isArchived()) {
            throw new RuntimeException(
                    "Cannot manage sprints for an archived project"
            );
        }

        return project;
    }

    private void validateDates(
            LocalDate startDate,
            LocalDate endDate
    ) {
        if (startDate == null) {
            throw new IllegalArgumentException(
                    "Sprint start date is required"
            );
        }

        if (endDate == null) {
            throw new IllegalArgumentException(
                    "Sprint end date is required"
            );
        }

        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException(
                    "Sprint end date cannot be before start date"
            );
        }
    }

    private void validateStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException(
                    "Sprint status is required"
            );
        }

        String normalizedStatus = status.trim().toUpperCase();

        if (!STATUS_PLANNED.equals(normalizedStatus)
                && !STATUS_ACTIVE.equals(normalizedStatus)
                && !STATUS_COMPLETED.equals(normalizedStatus)
                && !STATUS_CANCELLED.equals(normalizedStatus)) {

            throw new IllegalArgumentException(
                    "Invalid sprint status. Allowed values: "
                            + "PLANNED, ACTIVE, COMPLETED, CANCELLED"
            );
        }
    }

    private String normalizeGoal(String goal) {
        if (goal == null || goal.isBlank()) {
            return null;
        }

        return goal.trim();
    }
}