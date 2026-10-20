package com.enclave.project.service;

import com.enclave.audit.service.AuditLogService;
import com.enclave.organization.repository.OrganizationMemberRepository;
import com.enclave.project.entity.Project;
import com.enclave.project.repository.ProjectMemberRepository;
import com.enclave.project.repository.ProjectRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final AuditLogService auditLogService;
    private final ProjectMemberRepository projectMemberRepository;
    private final OrganizationMemberRepository organizationMemberRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            AuditLogService auditLogService,
            ProjectMemberRepository projectMemberRepository,
            OrganizationMemberRepository organizationMemberRepository
    ) {
        this.projectRepository = projectRepository;
        this.auditLogService = auditLogService;
        this.projectMemberRepository = projectMemberRepository;
        this.organizationMemberRepository = organizationMemberRepository;
    }

    // Get all active projects for an organization.
    // Existing behavior is preserved for existing callers.
    public List<Project> getActiveProjects(UUID organizationId) {
        return projectRepository
                .findByOrganizationIdAndArchivedFalse(organizationId);
    }

    // Get active projects visible to a specific user.
    // Team Members see only projects they belong to.
    public List<Project> getActiveProjectsForUser(
            UUID organizationId,
            UUID userId
    ) {
        String roleName = getActiveOrganizationRole(
                organizationId,
                userId
        );

        if (!"TEAM_MEMBER".equalsIgnoreCase(roleName)) {
            return getActiveProjects(organizationId);
        }

        List<UUID> projectIds = projectMemberRepository
                .findByUserId(userId)
                .stream()
                .map(projectMember -> projectMember.getProjectId())
                .toList();

        return projectRepository
                .findByOrganizationIdAndArchivedFalse(organizationId)
                .stream()
                .filter(project -> projectIds.contains(project.getId()))
                .toList();
    }

    // Get one project only if the user is allowed to view it.
    public Project getProjectByIdForUser(
            UUID organizationId,
            UUID projectId,
            UUID userId
    ) {
        String roleName = getActiveOrganizationRole(
                organizationId,
                userId
        );

        Project project = getProjectById(
                organizationId,
                projectId
        );

        if ("TEAM_MEMBER".equalsIgnoreCase(roleName)
                && !projectMemberRepository
                        .existsByProjectIdAndUserId(projectId, userId)) {
            throw new RuntimeException(
                    "You are not a member of this project"
            );
        }

        return project;
    }

    // Get the user's active organization role.
    private String getActiveOrganizationRole(
            UUID organizationId,
            UUID userId
    ) {
        return organizationMemberRepository
                .findByOrganization_IdAndUser_Id(organizationId, userId)
                .filter(membership -> membership.isActive())
                .map(membership -> membership.getRole().getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Active organization membership not found"
                        )
                );
    }

    // Get one project and verify its organization.
    public Project getProjectById(
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

        return project;
    }

    // Create a project and record the action.
    @Transactional
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

        Project savedProject = projectRepository.save(project);

        auditLogService.recordAction(
                organizationId,
                createdBy,
                "PROJECT_CREATED",
                "PROJECT",
                savedProject.getId(),
                createDetails(savedProject.getName())
        );

        return savedProject;
    }

    // Update an existing project and record the action.
    @Transactional
    public Project updateProject(
            UUID organizationId,
            UUID projectId,
            UUID actorId,
            String name,
            String description,
            LocalDate startDate,
            LocalDate endDate
    ) {
    	ensureNotTeamMember(organizationId, actorId);
        Project project = getProjectById(organizationId, projectId);

        project.setName(name);
        project.setDescription(description);
        project.setStartDate(startDate);
        project.setEndDate(endDate);
        project.setUpdatedAt(LocalDateTime.now());

        Project savedProject = projectRepository.save(project);

        auditLogService.recordAction(
                organizationId,
                actorId,
                "PROJECT_UPDATED",
                "PROJECT",
                savedProject.getId(),
                createDetails(savedProject.getName())
        );

        return savedProject;
    }

    // Archive a project and record the action.
    @Transactional
    public Project archiveProject(
            UUID organizationId,
            UUID projectId,
            UUID actorId
    ) {
    	ensureNotTeamMember(organizationId, actorId);
    	
        Project project = getProjectById(organizationId, projectId);

        if (project.isArchived()) {
            throw new RuntimeException("Project is already archived");
        }

        project.setArchived(true);
        project.setUpdatedAt(LocalDateTime.now());

        Project savedProject = projectRepository.save(project);

        auditLogService.recordAction(
                organizationId,
                actorId,
                "PROJECT_ARCHIVED",
                "PROJECT",
                savedProject.getId(),
                createDetails(savedProject.getName())
        );

        return savedProject;
    }

    // Restore an archived project and record the action.
    @Transactional
    public Project restoreProject(
            UUID organizationId,
            UUID projectId,
            UUID actorId
    ) {
    	ensureNotTeamMember(organizationId, actorId);
    	
        Project project = getProjectById(organizationId, projectId);

        if (!project.isArchived()) {
            throw new RuntimeException("Project is not archived");
        }

        project.setArchived(false);
        project.setUpdatedAt(LocalDateTime.now());

        Project savedProject = projectRepository.save(project);

        auditLogService.recordAction(
                organizationId,
                actorId,
                "PROJECT_RESTORED",
                "PROJECT",
                savedProject.getId(),
                createDetails(savedProject.getName())
        );

        return savedProject;
    }

    // Get archived projects.
    public List<Project> getArchivedProjects(UUID organizationId) {
        return projectRepository
                .findByOrganizationIdAndArchivedTrue(organizationId);
    }

    // Build valid JSON for the audit log details column.
    private String createDetails(String projectName) {
        String safeName = projectName == null
                ? ""
                : projectName
                        .replace("\\", "\\\\")
                        .replace("\"", "\\\"");

        return "{\"projectName\":\"" + safeName + "\"}";
    }
    
    private void ensureNotTeamMember(UUID organizationId, UUID userId) {
        String roleName = getActiveOrganizationRole(
                organizationId,
                userId
        );

        if ("TEAM_MEMBER".equalsIgnoreCase(roleName)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Team Members cannot modify project details"
            );
        }
    }
}
