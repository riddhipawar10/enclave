package com.enclave.taskcomment.service;

import com.enclave.notification.dto.CreateNotificationRequest;
import com.enclave.notification.service.NotificationService;
import com.enclave.task.entity.Task;
import com.enclave.task.repository.TaskRepository;
import com.enclave.taskcomment.dto.CreateCommentRequest;
import com.enclave.taskcomment.dto.TaskCommentResponse;
import com.enclave.taskcomment.entity.TaskComment;
import com.enclave.taskcomment.repository.TaskCommentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TaskCommentService {

    private final TaskCommentRepository taskCommentRepository;
    private final TaskRepository taskRepository;
    private final NotificationService notificationService;

    public TaskCommentService(
            TaskCommentRepository taskCommentRepository,
            TaskRepository taskRepository,
            NotificationService notificationService
    ) {
        this.taskCommentRepository = taskCommentRepository;
        this.taskRepository = taskRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<TaskCommentResponse> getComments(
            UUID taskId
    ) {
        return taskCommentRepository
                .findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream()
                .map(TaskCommentResponse::fromEntity)
                .toList();
    }

    public TaskCommentResponse createComment(
            UUID taskId,
            CreateCommentRequest request
    ) {
        /*
         * Find the task first so we can determine
         * who should receive the notification.
         */
        Task task = taskRepository
                .findById(taskId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Task not found"
                        )
                );

        /*
         * Prevent blank content after trimming.
         *
         * @NotBlank already protects the request,
         * but this also handles whitespace-only content
         * after the request reaches the service.
         */
        String content = request.content().trim();

        if (content.isEmpty()) {
            throw new IllegalArgumentException(
                    "Comment content cannot be empty"
            );
        }

        TaskComment comment = TaskComment.builder()
                .taskId(taskId)
                .userId(request.userId())
                .content(content)
                .build();

        TaskComment savedComment =
                taskCommentRepository.save(comment);

        /*
         * Create a notification for the task's
         * assignee or creator.
         */
        createCommentNotification(task, savedComment);

        return TaskCommentResponse.fromEntity(savedComment);
    }

    public void deleteComment(
            UUID userId,
            UUID commentId
    ) {
        TaskComment comment =
                taskCommentRepository.findById(commentId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Comment not found"
                                )
                        );

        /*
         * Only the user who created the comment
         * can delete it.
         */
        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException(
                    "Comment does not belong to this user"
            );
        }

        taskCommentRepository.delete(comment);
    }

    /**
     * Creates a notification when a new comment
     * is added to a task.
     *
     * Recipient:
     * 1. Task assignee, when one exists.
     * 2. Otherwise, task creator.
     */
    private void createCommentNotification(
            Task task,
            TaskComment comment
    ) {
        UUID notificationUserId;

        if (task.getAssignedTo() != null) {
            notificationUserId = task.getAssignedTo();
        } else {
            notificationUserId = task.getCreatedBy();
        }

        /*
         * No valid recipient.
         */
        if (notificationUserId == null) {
            return;
        }

        /*
         * Do not notify the user who wrote the comment
         * when they are also the task recipient.
         */
        if (notificationUserId.equals(comment.getUserId())) {
            return;
        }

        String notificationMessage =
                "A new comment was added to your task: "
                        + task.getTitle();

        CreateNotificationRequest request =
        		new CreateNotificationRequest(
        			    notificationUserId,
        			    "COMMENT",
        			    "New Comment",
        			    notificationMessage,
        			    task.getId(),
        			    "TASK",
        			    task.getProjectId()
        		);

        notificationService.createNotification(request);
    }
}