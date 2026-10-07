package com.enclave.taskcomment.controller;

import com.enclave.taskcomment.dto.CreateCommentRequest;
import com.enclave.taskcomment.dto.TaskCommentResponse;
import com.enclave.taskcomment.service.TaskCommentService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
public class TaskCommentController {

    private final TaskCommentService taskCommentService;

    public TaskCommentController(
            TaskCommentService taskCommentService
    ) {
        this.taskCommentService = taskCommentService;
    }

    @GetMapping
    public ResponseEntity<List<TaskCommentResponse>> getComments(
            @PathVariable UUID taskId
    ) {
        return ResponseEntity.ok(
                taskCommentService.getComments(taskId)
        );
    }

    @PostMapping
    public ResponseEntity<TaskCommentResponse> createComment(
            @PathVariable UUID taskId,
            @Valid @RequestBody CreateCommentRequest request
    ) {
        return ResponseEntity.ok(
                taskCommentService.createComment(
                        taskId,
                        request
                )
        );
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID taskId,
            @PathVariable UUID commentId,
            @RequestParam UUID userId
    ) {
        taskCommentService.deleteComment(
                userId,
                commentId
        );

        return ResponseEntity.noContent().build();
    }
}