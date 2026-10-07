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
        return ResponseEntity.ok(
                taskService.getTasksByProject(projectId)
        );
    }

    @PostMapping
    @RequirePermission("CREATE_PROJECT")
    public ResponseEntity<Task> createTask(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("projectId") UUID projectId,
            @Valid @RequestBody CreateTaskRequest request
    ) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        User currentUser =
                (User) authentication.getPrincipal();

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

        Task task = taskService.updateTask(
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

        taskService.deleteTask(taskId);

        return ResponseEntity.noContent().build();
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