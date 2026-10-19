
package com.enclave.task.controller;

import com.enclave.rbac.security.RequirePermission;
import com.enclave.task.entity.Task;
import com.enclave.task.service.TaskService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations/{organizationId}/tasks")
public class OrganizationTaskController {

    private final TaskService taskService;

    public OrganizationTaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * Get all tasks belonging to projects in an organization.
     */
    @GetMapping
    @RequirePermission("VIEW_TASK")
    public ResponseEntity<List<Task>> getTasksByOrganization(
            @PathVariable("organizationId") UUID organizationId
    ) {
        List<Task> tasks =
                taskService.getTasksByOrganization(organizationId);

        return ResponseEntity.ok(tasks);
    }
}
