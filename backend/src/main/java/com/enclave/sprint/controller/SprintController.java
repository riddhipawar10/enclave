package com.enclave.sprint.controller;

import com.enclave.auth.entity.User;
import com.enclave.rbac.security.RequirePermission;
import com.enclave.sprint.dto.CreateSprintRequest;
import com.enclave.sprint.dto.UpdateSprintRequest;
import com.enclave.sprint.entity.Sprint;
import com.enclave.sprint.service.SprintService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations/{organizationId}/projects/{projectId}/sprints")
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @GetMapping
    @RequirePermission("VIEW_PROJECT")
    public ResponseEntity<List<Sprint>> getSprints(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("projectId") UUID projectId
    ) {
        return ResponseEntity.ok(
                sprintService.getSprintsByProject(
                        organizationId,
                        projectId
                )
        );
    }

    @GetMapping("/{sprintId}")
    @RequirePermission("VIEW_PROJECT")
    public ResponseEntity<Sprint> getSprint(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("projectId") UUID projectId,
            @PathVariable("sprintId") UUID sprintId
    ) {
        return ResponseEntity.ok(
                sprintService.getSprint(
                        organizationId,
                        projectId,
                        sprintId
                )
        );
    }

    @PostMapping
    @RequirePermission("CREATE_PROJECT")
    public ResponseEntity<Sprint> createSprint(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("projectId") UUID projectId,
            @Valid @RequestBody CreateSprintRequest request
    ) {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        User currentUser =
                (User) authentication.getPrincipal();

        Sprint sprint = sprintService.createSprint(
                organizationId,
                projectId,
                currentUser.getId(),
                request.name(),
                request.goal(),
                request.startDate(),
                request.endDate()
        );

        return ResponseEntity.ok(sprint);
    }

    @PutMapping("/{sprintId}")
    @RequirePermission("UPDATE_PROJECT")
    public ResponseEntity<Sprint> updateSprint(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("projectId") UUID projectId,
            @PathVariable("sprintId") UUID sprintId,
            @Valid @RequestBody UpdateSprintRequest request
    ) {
        Sprint sprint = sprintService.updateSprint(
                organizationId,
                projectId,
                sprintId,
                request.name(),
                request.goal(),
                request.startDate(),
                request.endDate(),
                request.status()
        );

        return ResponseEntity.ok(sprint);
    }

    @DeleteMapping("/{sprintId}")
    @RequirePermission("DELETE_PROJECT")
    public ResponseEntity<Void> deleteSprint(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("projectId") UUID projectId,
            @PathVariable("sprintId") UUID sprintId
    ) {
        sprintService.deleteSprint(
                organizationId,
                projectId,
                sprintId
        );

        return ResponseEntity.noContent().build();
    }
}