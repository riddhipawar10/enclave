
package com.enclave.task.controller;

import com.enclave.auth.entity.User;
import com.enclave.rbac.security.RequirePermission;
import com.enclave.task.entity.Task;
import com.enclave.task.service.TaskService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations/{organizationId}/projects/{projectId}/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    @RequirePermission("VIEW_TASK")
    public ResponseEntity<List<Task>> getTasks(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("projectId") UUID projectId
    ) {
        User currentUser = getCurrentUser();

        return ResponseEntity.ok(
                taskService.getTasksByProjectForUser(
                        organizationId,
                        projectId,
                        currentUser.getId()
                )
        );
    }

    @PostMapping
    @RequirePermission("CREATE_PROJECT")
    public ResponseEntity<Task> createTask(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("projectId") UUID projectId,
            @Valid @RequestBody CreateTaskRequest request
    ) {
        User currentUser = getCurrentUser();

        taskService.validateProjectAccess(
                organizationId,
                projectId,
                currentUser.getId()
        );

        taskService.ensureNotTeamMember(
                organizationId,
                currentUser.getId()
        );

        Task task = taskService.createTask(
                projectId,
                currentUser.getId(),
                request.title(),
                request.description(),
                request.statusId(),
                request.priorityId(),
                request.assignedTo(),
                request.dueDate(),
                request.sprintId()
        );

        return ResponseEntity.ok(task);
    }

    @PutMapping("/{taskId}")
    @RequirePermission("UPDATE_TASK")
    public ResponseEntity<Task> updateTask(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("projectId") UUID projectId,
            @PathVariable("taskId") UUID taskId,
            @Valid @RequestBody UpdateTaskRequest request
    ) {
        User currentUser = getCurrentUser();

        if (taskService.isTeamMember(
                organizationId,
                currentUser.getId()
        )) {
            Task task = taskService.updateTaskStatusForUser(
                    organizationId,
                    projectId,
                    taskId,
                    currentUser.getId(),
                    request.statusId()
            );

            return ResponseEntity.ok(task);
        }

        Task task = taskService.updateTaskForProject(
                organizationId,
                projectId,
                taskId,
                request.title(),
                request.description(),
                request.statusId(),
                request.priorityId(),
                request.assignedTo(),
                request.dueDate(),
                request.position(),
                request.sprintId()
        );

        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{taskId}")
    @RequirePermission("DELETE_TASK")
    public ResponseEntity<Void> deleteTask(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("projectId") UUID projectId,
            @PathVariable("taskId") UUID taskId
    ) {
        User currentUser = getCurrentUser();

        taskService.deleteTaskForProject(
                organizationId,
                projectId,
                taskId,
                currentUser.getId()
        );

        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return (User) authentication.getPrincipal();
    }

    public record CreateTaskRequest(
            String title,
            String description,
            UUID statusId,
            UUID priorityId,
            UUID assignedTo,
            LocalDate dueDate,
            UUID sprintId
    ) {
    }

    public record UpdateTaskRequest(
            String title,
            String description,
            UUID statusId,
            UUID priorityId,
            UUID assignedTo,
            LocalDate dueDate,
            int position,
            UUID sprintId
    ) {
    }
}
