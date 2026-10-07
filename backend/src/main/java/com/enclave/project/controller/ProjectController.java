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

    @GetMapping
    @RequirePermission("VIEW_PROJECT")
    public ResponseEntity<List<Project>> getProjects(
            @PathVariable("organizationId") UUID organizationId
    ) {

        List<Project> projects =
                projectService.getActiveProjects(organizationId);

        return ResponseEntity.ok(projects);
    }

    @PostMapping
    @RequirePermission("CREATE_PROJECT")
    public ResponseEntity<Project> createProject(
            @PathVariable("organizationId") UUID organizationId,
            @RequestBody CreateProjectRequest request
    ) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        User currentUser =
                (User) authentication.getPrincipal();

        Project project =
                projectService.createProject(
                        organizationId,
                        currentUser.getId(),
                        request.name(),
                        request.description(),
                        request.startDate(),
                        request.endDate()
                );

        return ResponseEntity.ok(project);
    }

    @PutMapping("/{projectId}")
    @RequirePermission("UPDATE_PROJECT")
    public ResponseEntity<Project> updateProject(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("projectId") UUID projectId,
            @RequestBody UpdateProjectRequest request
    ) {

    	Project project =
    	        projectService.updateProject(
    	                organizationId,
    	                projectId,
    	                request.name(),
    	                request.description(),
    	                request.startDate(),
    	                request.endDate()
    	        );

        return ResponseEntity.ok(project);
    }

    public record CreateProjectRequest(
            String name,
            String description,
            LocalDate startDate,
            LocalDate endDate
    ) {
    }

    public record UpdateProjectRequest(
            String name,
            String description,
            LocalDate startDate,
            LocalDate endDate
    ) {
    }
}