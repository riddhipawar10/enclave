package com.enclave.taskcomment.dto;

import com.enclave.taskcomment.entity.TaskComment;

import java.time.LocalDateTime;
import java.util.UUID;

public record TaskCommentResponse(
        UUID id,
        UUID taskId,
        UUID userId,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static TaskCommentResponse fromEntity(
            TaskComment comment
    ) {
        return new TaskCommentResponse(
                comment.getId(),
                comment.getTaskId(),
                comment.getUserId(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}