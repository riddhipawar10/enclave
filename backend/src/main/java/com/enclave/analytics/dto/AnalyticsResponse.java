package com.enclave.analytics.dto;

import java.util.List;

public record AnalyticsResponse(
        long totalTasks,
        long todoTasks,
        long inProgressTasks,
        long reviewTasks,
        long completedTasks,
        long overdueTasks,
        long lowPriorityTasks,
        long mediumPriorityTasks,
        long highPriorityTasks,
        long urgentPriorityTasks,
        long activeSprintTasks,
        long activeSprintCompletedTasks,
        String activeSprintName,
        List<SprintAnalytics> sprintProgress,
        List<CompletionTrend> completionTrend
) {

    public record SprintAnalytics(
            String sprintId,
            String sprintName,
            String status,
            long totalTasks,
            long completedTasks
    ) {
    }

    public record CompletionTrend(
            String date,
            long completedTasks,
            long cumulativeCompletedTasks
    ) {
    }
}