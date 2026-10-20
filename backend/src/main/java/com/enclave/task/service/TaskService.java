
package com.enclave.task.service;

import com.enclave.notification.dto.CreateNotificationRequest;
import com.enclave.notification.service.NotificationService;
import com.enclave.organization.entity.OrganizationMember;
import com.enclave.organization.repository.OrganizationMemberRepository;
import com.enclave.project.entity.Project;
import com.enclave.project.repository.ProjectMemberRepository;
import com.enclave.project.repository.ProjectRepository;
import com.enclave.task.entity.Task;
import com.enclave.task.repository.TaskRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class TaskService {

    private static final String TEAM_MEMBER_ROLE = "TEAM_MEMBER";

    private static final UUID DONE_STATUS_ID =
            UUID.fromString("ceceaeed-5a8f-494f-9005-8c7330eb4e35");

    private final TaskRepository taskRepository;
    private final NotificationService notificationService;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final OrganizationMemberRepository organizationMemberRepository;

    public TaskService(
            TaskRepository taskRepository,
            NotificationService notificationService,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            OrganizationMemberRepository organizationMemberRepository
    ) {
        this.taskRepository = taskRepository;
        this.notificationService = notificationService;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.organizationMemberRepository = organizationMemberRepository;
    }

    // Existing method retained for existing callers.
    public List<Task> getTasksByProject(UUID projectId) {
        return taskRepository.findByProjectIdOrderByPositionAsc(projectId);
    }

    // Return only tasks the current user is permitted to see.
    public List<Task> getTasksByProjectForUser(
            UUID organizationId,
            UUID projectId,
            UUID userId
    ) {
        validateProjectAccess(organizationId, projectId, userId);

        List<Task> tasks =
                taskRepository.findByProjectIdOrderByPositionAsc(projectId);

        if (isTeamMember(organizationId, userId)) {
            return tasks.stream()
                    .filter(task -> userId.equals(task.getAssignedTo()))
                    .toList();
        }

        return tasks;
    }

    // Existing organization-level method retained.
    public List<Task> getTasksByOrganization(UUID organizationId) {
        return taskRepository.findByOrganizationId(organizationId);
    }

    public Task getTask(UUID taskId) {
        return taskRepository
                .findById(taskId)
                .orElseThrow(() ->
                        new RuntimeException("Task not found"));
    }

    public boolean isTeamMember(UUID organizationId, UUID userId) {
        return TEAM_MEMBER_ROLE.equals(getActiveRoleName(
                organizationId,
                userId
        ));
    }

    public void ensureNotTeamMember(
            UUID organizationId,
            UUID userId
    ) {
        if (isTeamMember(organizationId, userId)) {
            throw new AccessDeniedException(
                    "Team Members cannot create or assign tasks"
            );
        }
    }

    public void validateProjectAccess(
            UUID organizationId,
            UUID projectId,
            UUID userId
    ) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        if (!organizationId.equals(project.getOrganizationId())) {
            throw new AccessDeniedException(
                    "Project does not belong to this organization"
            );
        }

        if (isTeamMember(organizationId, userId)
                && !projectMemberRepository.existsByProjectIdAndUserId(
                        projectId,
                        userId
                )) {
            throw new AccessDeniedException(
                    "You are not a member of this project"
            );
        }
    }

    // Full update for roles that can manage task details.
    @Transactional
    public Task updateTaskForProject(
            UUID organizationId,
            UUID projectId,
            UUID taskId,
            String title,
            String description,
            UUID statusId,
            UUID priorityId,
            UUID assignedTo,
            LocalDate dueDate,
            int position,
            UUID sprintId
    ) {
        validateTaskProject(organizationId, projectId, taskId);

        return updateTask(
                taskId,
                title,
                description,
                statusId,
                priorityId,
                assignedTo,
                dueDate,
                position,
                sprintId
        );
    }

    // Team Members may update only the status of their own assigned task.
    @Transactional
    public Task updateTaskStatusForUser(
            UUID organizationId,
            UUID projectId,
            UUID taskId,
            UUID userId,
            UUID statusId
    ) {
        validateProjectAccess(organizationId, projectId, userId);

        if (!isTeamMember(organizationId, userId)) {
            throw new AccessDeniedException(
                    "This operation is only for Team Members"
            );
        }

        Task task = validateTaskProject(
                organizationId,
                projectId,
                taskId
        );

        if (!userId.equals(task.getAssignedTo())) {
            throw new AccessDeniedException(
                    "You can update only tasks assigned to you"
            );
        }

        // Keep all task details unchanged.
        return updateTask(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                statusId,
                task.getPriorityId(),
                task.getAssignedTo(),
                task.getDueDate(),
                task.getPosition(),
                task.getSprintId()
        );
    }

    @Transactional
    public void deleteTaskForProject(
            UUID organizationId,
            UUID projectId,
            UUID taskId,
            UUID userId
    ) {
        validateTaskProject(organizationId, projectId, taskId);

        if (isTeamMember(organizationId, userId)) {
            throw new AccessDeniedException(
                    "Team Members cannot delete tasks"
            );
        }

        deleteTask(taskId);
    }

    private Task validateTaskProject(
            UUID organizationId,
            UUID projectId,
            UUID taskId
    ) {
        validateProjectOrganization(organizationId, projectId);

        Task task = getTask(taskId);

        if (!projectId.equals(task.getProjectId())) {
            throw new AccessDeniedException(
                    "Task does not belong to this project"
            );
        }

        return task;
    }

    private void validateProjectOrganization(
            UUID organizationId,
            UUID projectId
    ) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        if (!organizationId.equals(project.getOrganizationId())) {
            throw new AccessDeniedException(
                    "Project does not belong to this organization"
            );
        }
    }

    private String getActiveRoleName(
            UUID organizationId,
            UUID userId
    ) {
        OrganizationMember membership =
                organizationMemberRepository
                        .findByOrganization_IdAndUser_Id(
                                organizationId,
                                userId
                        )
                        .filter(OrganizationMember::isActive)
                        .orElseThrow(() ->
                                new AccessDeniedException(
                                        "No active organization membership"
                                ));

        return membership.getRole().getName();
    }

    public Task createTask(
            UUID projectId,
            UUID createdBy,
            String title,
            String description,
            UUID statusId,
            UUID priorityId,
            UUID assignedTo,
            LocalDate dueDate,
            UUID sprintId
    ) {
        Task task = new Task();

        task.setProjectId(projectId);
        task.setSprintId(sprintId);
        task.setCreatedBy(createdBy);
        task.setTitle(title);
        task.setDescription(description);
        task.setStatusId(statusId);
        task.setPriorityId(priorityId);
        task.setAssignedTo(assignedTo);
        task.setDueDate(dueDate);
        task.setPosition(0);

        LocalDateTime now = LocalDateTime.now();

        task.setCreatedAt(now);
        task.setUpdatedAt(now);

        if (DONE_STATUS_ID.equals(statusId)) {
            task.setCompletedAt(now);
        }

        Task savedTask = taskRepository.save(task);

        if (assignedTo != null) {
            createTaskAssignedNotification(savedTask);
        }

        return savedTask;
    }

    public Task updateTask(
            UUID taskId,
            String title,
            String description,
            UUID statusId,
            UUID priorityId,
            UUID assignedTo,
            LocalDate dueDate,
            int position,
            UUID sprintId
    ) {
        Task task = getTask(taskId);

        UUID previousStatusId = task.getStatusId();
        UUID previousAssignedTo = task.getAssignedTo();
        UUID previousPriorityId = task.getPriorityId();
        LocalDate previousDueDate = task.getDueDate();
        UUID previousSprintId = task.getSprintId();
        String previousTitle = task.getTitle();
        String previousDescription = task.getDescription();

        boolean taskDetailsChanged =
                !Objects.equals(previousTitle, title)
                        || !Objects.equals(previousDescription, description)
                        || !Objects.equals(previousPriorityId, priorityId)
                        || !Objects.equals(previousDueDate, dueDate)
                        || !Objects.equals(previousSprintId, sprintId);

        task.setTitle(title);
        task.setDescription(description);
        task.setStatusId(statusId);
        task.setPriorityId(priorityId);
        task.setAssignedTo(assignedTo);
        task.setDueDate(dueDate);
        task.setPosition(position);
        task.setSprintId(sprintId);
        task.setUpdatedAt(LocalDateTime.now());

        boolean taskCompleted =
                DONE_STATUS_ID.equals(statusId)
                        && !DONE_STATUS_ID.equals(previousStatusId);

        if (taskCompleted) {
            task.setCompletedAt(LocalDateTime.now());
        } else if (!DONE_STATUS_ID.equals(statusId)) {
            task.setCompletedAt(null);
        }

        Task savedTask = taskRepository.save(task);

        boolean assigneeChanged =
                assignedTo != null
                        && !assignedTo.equals(previousAssignedTo);

        if (assigneeChanged) {
            if (previousAssignedTo == null) {
                createTaskAssignedNotification(savedTask);
            } else {
                createTaskReassignedNotification(savedTask);
            }
        }

        if (taskCompleted) {
            createTaskCompletedNotification(savedTask);
        }

        if (taskDetailsChanged) {
            createTaskUpdatedNotification(savedTask);
        }

        return savedTask;
    }

    public void deleteTask(UUID taskId) {
        Task task = getTask(taskId);
        taskRepository.delete(task);
    }

    private void createTaskAssignedNotification(Task task) {
        CreateNotificationRequest request =
                new CreateNotificationRequest(
                        task.getAssignedTo(),
                        "TASK_ASSIGNED",
                        "New Task Assigned",
                        "You have been assigned the task: "
                                + task.getTitle(),
                        task.getId(),
                        "TASK",
                        task.getProjectId()
                );

        notificationService.createNotification(request);
    }

    private void createTaskReassignedNotification(Task task) {
        CreateNotificationRequest request =
                new CreateNotificationRequest(
                        task.getAssignedTo(),
                        "TASK_REASSIGNED",
                        "Task Reassigned",
                        "The task has been reassigned to you: "
                                + task.getTitle(),
                        task.getId(),
                        "TASK",
                        task.getProjectId()
                );

        notificationService.createNotification(request);
    }

    private void createTaskCompletedNotification(Task task) {
        UUID notificationUserId =
                task.getAssignedTo() != null
                        ? task.getAssignedTo()
                        : task.getCreatedBy();

        if (notificationUserId == null) {
            return;
        }

        CreateNotificationRequest request =
                new CreateNotificationRequest(
                        notificationUserId,
                        "TASK_COMPLETED",
                        "Task Completed",
                        "The task has been completed: "
                                + task.getTitle(),
                        task.getId(),
                        "TASK",
                        task.getProjectId()
                );

        notificationService.createNotification(request);
    }

    private void createTaskUpdatedNotification(Task task) {
        UUID notificationUserId =
                task.getAssignedTo() != null
                        ? task.getAssignedTo()
                        : task.getCreatedBy();

        if (notificationUserId == null) {
            return;
        }

        CreateNotificationRequest request =
                new CreateNotificationRequest(
                        notificationUserId,
                        "TASK_UPDATED",
                        "Task Updated",
                        "The task has been updated: "
                                + task.getTitle(),
                        task.getId(),
                        "TASK",
                        task.getProjectId()
                );

        notificationService.createNotification(request);
    }
}
