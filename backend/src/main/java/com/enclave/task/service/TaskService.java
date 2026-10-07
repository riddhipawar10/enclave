package com.enclave.task.service;

import com.enclave.notification.dto.CreateNotificationRequest;
import com.enclave.notification.service.NotificationService;
import com.enclave.task.entity.Task;
import com.enclave.task.repository.TaskRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class TaskService {

    private static final UUID DONE_STATUS_ID =
            UUID.fromString("ceceaeed-5a8f-494f-9005-8c7330eb4e35");

    private final TaskRepository taskRepository;
    private final NotificationService notificationService;

    public TaskService(
            TaskRepository taskRepository,
            NotificationService notificationService
    ) {
        this.taskRepository = taskRepository;
        this.notificationService = notificationService;
    }

    public List<Task> getTasksByProject(UUID projectId) {
        return taskRepository.findByProjectIdOrderByPositionAsc(projectId);
    }

    public Task getTask(UUID taskId) {
        return taskRepository
                .findById(taskId)
                .orElseThrow(() ->
                        new RuntimeException("Task not found"));
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

        // If the task is created directly as DONE,
        // record the completion time.
        if (DONE_STATUS_ID.equals(statusId)) {
            task.setCompletedAt(now);
        }

        Task savedTask = taskRepository.save(task);

        // Notify the assigned user when a task is
        // assigned during creation.
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

        // Store previous values before updating.
        UUID previousStatusId = task.getStatusId();
        UUID previousAssignedTo = task.getAssignedTo();
        UUID previousPriorityId = task.getPriorityId();
        LocalDate previousDueDate = task.getDueDate();
        UUID previousSprintId = task.getSprintId();
        String previousTitle = task.getTitle();
        String previousDescription = task.getDescription();

        /*
         * Detect meaningful task-detail changes.
         *
         * These changes create TASK_UPDATED:
         * - title
         * - description
         * - priority
         * - due date
         * - sprint
         *
         * Status and position changes are intentionally excluded
         * because Board drag-and-drop should not create noisy
         * TASK_UPDATED notifications.
         */
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

        /*
         * Detect whether the task has just been completed.
         */
        boolean taskCompleted =
                DONE_STATUS_ID.equals(statusId)
                        && !DONE_STATUS_ID.equals(previousStatusId);

        if (taskCompleted) {
            task.setCompletedAt(LocalDateTime.now());
        } else if (!DONE_STATUS_ID.equals(statusId)) {
            // Task moved back from DONE.
            task.setCompletedAt(null);
        }

        Task savedTask = taskRepository.save(task);

        /*
         * Detect assignment changes.
         */
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

        /*
         * Create completion notification when the task
         * changes into DONE.
         */
        if (taskCompleted) {
            createTaskCompletedNotification(savedTask);
        }

        /*
         * Create TASK_UPDATED notification for meaningful
         * task-detail changes.
         */
        if (taskDetailsChanged) {
            createTaskUpdatedNotification(savedTask);
        }

        return savedTask;
    }

    public void deleteTask(UUID taskId) {
        Task task = getTask(taskId);

        taskRepository.delete(task);
    }

    /**
     * Notification for a newly assigned task.
     */
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

    /**
     * Notification when a task is reassigned
     * from one user to another.
     */
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

    /**
     * Notification when a task is completed.
     *
     * If the task has an assignee, notify the assignee.
     * Otherwise, notify the task creator.
     */
    private void createTaskCompletedNotification(Task task) {

        UUID notificationUserId;

        if (task.getAssignedTo() != null) {
            notificationUserId = task.getAssignedTo();
        } else {
            notificationUserId = task.getCreatedBy();
        }

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

    /**
     * Notification when meaningful task details are updated.
     *
     * If the task has an assignee, notify the assignee.
     * Otherwise, notify the task creator.
     */
    private void createTaskUpdatedNotification(Task task) {

        UUID notificationUserId;

        if (task.getAssignedTo() != null) {
            notificationUserId = task.getAssignedTo();
        } else {
            notificationUserId = task.getCreatedBy();
        }

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