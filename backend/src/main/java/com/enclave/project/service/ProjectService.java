package com.enclave.project.service;

import com.enclave.project.entity.Project;
import com.enclave.project.repository.ProjectRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public List<Project> getActiveProjects(UUID organizationId) {
        return projectRepository
                .findByOrganizationIdAndArchivedFalse(organizationId);
    }

    public Project createProject(
            UUID organizationId,
            UUID createdBy,
            String name,
            String description,
            LocalDate startDate,
            LocalDate endDate
    ) {
        Project project = new Project();

        project.setOrganizationId(organizationId);
        project.setCreatedBy(createdBy);
        project.setName(name);
        project.setDescription(description);
        project.setStartDate(startDate);
        project.setEndDate(endDate);
        project.setArchived(false);

        LocalDateTime now = LocalDateTime.now();

        project.setCreatedAt(now);
        project.setUpdatedAt(now);

        return projectRepository.save(project);
    }

    public Project updateProject(
            UUID organizationId,
            UUID projectId,
            String name,
            String description,
            LocalDate startDate,
            LocalDate endDate
    ) {
        Project project =
                projectRepository.findById(projectId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found"
                                )
                        );

        if (!project.getOrganizationId().equals(organizationId)) {
            throw new RuntimeException(
                    "Project does not belong to this organization"
            );
        }

        project.setName(name);
        project.setDescription(description);
        project.setStartDate(startDate);
        project.setEndDate(endDate);
        project.setUpdatedAt(LocalDateTime.now());

        return projectRepository.save(project);
    }
}