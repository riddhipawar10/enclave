
package com.enclave.project.controller;

import com.enclave.auth.entity.User;
import com.enclave.project.entity.Project;
import com.enclave.project.service.ProjectService;
import com.enclave.rbac.security.RequirePermission;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations/{organizationId}/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // Get active projects visible to the authenticated user.
    @GetMapping
    @RequirePermission("VIEW_PROJECT")
    public ResponseEntity<List<Project>> getProjects(
            @PathVariable("organizationId") UUID organizationId
    ) {
        UUID currentUserId = getCurrentUserId();

        List<Project> projects =
                projectService.getActiveProjectsForUser(
                        organizationId,
                        currentUserId
                );

        return ResponseEntity.ok(projects);
    }

    // Get one project only if the user is allowed to view it.
    @GetMapping("/{projectId}")
    @RequirePermission("VIEW_PROJECT")
    public ResponseEntity<Project> getProjectById(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("projectId") UUID projectId
    ) {
        Project project = projectService.getProjectByIdForUser(
                organizationId,
                projectId,
                getCurrentUserId()
        );

        return ResponseEntity.ok(project);
    }

    // Create a project.
    @PostMapping
    @RequirePermission("CREATE_PROJECT")
    public ResponseEntity<Project> createProject(
            @PathVariable("organizationId") UUID organizationId,
            @RequestBody CreateProjectRequest request
    ) {
        UUID currentUserId = getCurrentUserId();

        Project project = projectService.createProject(
                organizationId,
                currentUserId,
                request.name(),
                request.description(),
                request.startDate(),
                request.endDate()
        );

        return ResponseEntity.ok(project);
    }

    // Update an existing project.
    @PutMapping("/{projectId}")
    @RequirePermission("UPDATE_PROJECT")
    public ResponseEntity<Project> updateProject(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("projectId") UUID projectId,
            @RequestBody UpdateProjectRequest request
    ) {
        Project project = projectService.updateProject(
                organizationId,
                projectId,
                getCurrentUserId(),
                request.name(),
                request.description(),
                request.startDate(),
                request.endDate()
        );

        return ResponseEntity.ok(project);
    }

    // Archive a project.
    @PatchMapping("/{projectId}/archive")
    @RequirePermission("UPDATE_PROJECT")
    public ResponseEntity<Project> archiveProject(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("projectId") UUID projectId
    ) {
        Project project = projectService.archiveProject(
                organizationId,
                projectId,
                getCurrentUserId()
        );

        return ResponseEntity.ok(project);
    }

    // Restore an archived project.
    @PatchMapping("/{projectId}/restore")
    @RequirePermission("UPDATE_PROJECT")
    public ResponseEntity<Project> restoreProject(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("projectId") UUID projectId
    ) {
        Project project = projectService.restoreProject(
                organizationId,
                projectId,
                getCurrentUserId()
        );

        return ResponseEntity.ok(project);
    }

    // Get archived projects for an organization.
    @GetMapping("/archived")
    @RequirePermission("VIEW_PROJECT")
    public ResponseEntity<List<Project>> getArchivedProjects(
            @PathVariable("organizationId") UUID organizationId
    ) {
        List<Project> projects =
                projectService.getArchivedProjects(organizationId);

        return ResponseEntity.ok(projects);
    }

    // Safely identify the authenticated user.
    private UUID getCurrentUserId() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !(authentication.getPrincipal() instanceof User currentUser)) {
            throw new IllegalStateException(
                    "Authenticated user could not be identified"
            );
        }

        return currentUser.getId();
    }

    public record CreateProjectRequest(
            String name,
            String description,
            LocalDate startDate,
            LocalDate endDate
    ) {}

    public record UpdateProjectRequest(
            String name,
            String description,
            LocalDate startDate,
            LocalDate endDate
    ) {}
}


