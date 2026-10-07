package com.enclave.analytics.service;

import com.enclave.analytics.dto.AnalyticsResponse;
import com.enclave.sprint.entity.Sprint;
import com.enclave.sprint.repository.SprintRepository;
import com.enclave.task.entity.Task;
import com.enclave.task.repository.TaskRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private static final UUID TODO_STATUS_ID =
            UUID.fromString("ef25e678-91e9-4eb8-b8a1-fce9accd840f");

    private static final UUID IN_PROGRESS_STATUS_ID =
            UUID.fromString("cf8e322b-86ed-4597-8d4c-dd17dc917273");

    private static final UUID REVIEW_STATUS_ID =
            UUID.fromString("4e33e701-a87f-439b-801c-083c4d36d87c");

    private static final UUID DONE_STATUS_ID =
            UUID.fromString("ceceaeed-5a8f-494f-9005-8c7330eb4e35");

    private static final UUID LOW_PRIORITY_ID =
            UUID.fromString("81f9c1a3-2793-4e4f-8a0c-51f5f79bf45a");

    private static final UUID MEDIUM_PRIORITY_ID =
            UUID.fromString("ff8a5fd3-a10d-4bee-a79e-3f579ce2e76b");

    private static final UUID HIGH_PRIORITY_ID =
            UUID.fromString("ccb1a560-2cfe-4b5f-9fe3-d8af19196e55");

    private static final UUID URGENT_PRIORITY_ID =
            UUID.fromString("17153d97-f8bc-4fc6-8b41-abf279b98152");

    /*
     * Number of calendar days returned by the backend
     * for the completion trend.
     */
    private static final int COMPLETION_TREND_DAYS = 30;

    private final TaskRepository taskRepository;
    private final SprintRepository sprintRepository;

    public AnalyticsService(
            TaskRepository taskRepository,
            SprintRepository sprintRepository
    ) {
        this.taskRepository = taskRepository;
        this.sprintRepository = sprintRepository;
    }

    public AnalyticsResponse getProjectAnalytics(UUID projectId) {

        List<Task> tasks =
                taskRepository.findByProjectIdOrderByPositionAsc(projectId);

        List<Sprint> sprints =
                sprintRepository.findByProjectIdOrderByStartDateDesc(projectId);

        long totalTasks = tasks.size();

        long todoTasks =
                countByStatus(tasks, TODO_STATUS_ID);

        long inProgressTasks =
                countByStatus(tasks, IN_PROGRESS_STATUS_ID);

        long reviewTasks =
                countByStatus(tasks, REVIEW_STATUS_ID);

        long completedTasks =
                countByStatus(tasks, DONE_STATUS_ID);

        long overdueTasks = tasks.stream()
                .filter(this::isOverdue)
                .count();

        long lowPriorityTasks =
                countByPriority(tasks, LOW_PRIORITY_ID);

        long mediumPriorityTasks =
                countByPriority(tasks, MEDIUM_PRIORITY_ID);

        long highPriorityTasks =
                countByPriority(tasks, HIGH_PRIORITY_ID);

        long urgentPriorityTasks =
                countByPriority(tasks, URGENT_PRIORITY_ID);

        Sprint activeSprint = sprints.stream()
                .filter(sprint ->
                        "ACTIVE".equalsIgnoreCase(
                                sprint.getStatus()))
                .findFirst()
                .orElse(null);

        long activeSprintTasks = 0;
        long activeSprintCompletedTasks = 0;
        String activeSprintName = null;

        if (activeSprint != null) {

            activeSprintName =
                    activeSprint.getName();

            activeSprintTasks = tasks.stream()
                    .filter(task ->
                            activeSprint.getId()
                                    .equals(task.getSprintId()))
                    .count();

            activeSprintCompletedTasks = tasks.stream()
                    .filter(task ->
                            activeSprint.getId()
                                    .equals(task.getSprintId()))
                    .filter(task ->
                            DONE_STATUS_ID.equals(
                                    task.getStatusId()))
                    .count();
        }

        List<AnalyticsResponse.SprintAnalytics> sprintProgress =
                sprints.stream()
                        .map(sprint -> {

                            List<Task> sprintTasks =
                                    tasks.stream()
                                            .filter(task ->
                                                    sprint.getId()
                                                            .equals(task.getSprintId()))
                                            .toList();

                            long sprintTotal =
                                    sprintTasks.size();

                            long sprintCompleted =
                                    sprintTasks.stream()
                                            .filter(task ->
                                                    DONE_STATUS_ID.equals(
                                                            task.getStatusId()))
                                            .count();

                            return new AnalyticsResponse.SprintAnalytics(
                                    sprint.getId().toString(),
                                    sprint.getName(),
                                    sprint.getStatus(),
                                    sprintTotal,
                                    sprintCompleted
                            );
                        })
                        .toList();

        List<AnalyticsResponse.CompletionTrend> completionTrend =
                buildCompletionTrend(tasks);

        return new AnalyticsResponse(
                totalTasks,
                todoTasks,
                inProgressTasks,
                reviewTasks,
                completedTasks,
                overdueTasks,
                lowPriorityTasks,
                mediumPriorityTasks,
                highPriorityTasks,
                urgentPriorityTasks,
                activeSprintTasks,
                activeSprintCompletedTasks,
                activeSprintName,
                sprintProgress,
                completionTrend
        );
    }

    private List<AnalyticsResponse.CompletionTrend> buildCompletionTrend(
            List<Task> tasks
    ) {

        /*
         * Group completed tasks by calendar date.
         */
        Map<LocalDate, Long> completedByDate =
                tasks.stream()
                        .filter(task ->
                                task.getCompletedAt() != null)
                        .collect(Collectors.groupingBy(
                                task ->
                                        task.getCompletedAt()
                                                .toLocalDate(),
                                Collectors.counting()
                        ));

        /*
         * Always return the last 30 calendar days.
         *
         * This means dates with no completed tasks are still
         * included with completedTasks = 0.
         */
        LocalDate endDate =
                LocalDate.now();

        LocalDate startDate =
                endDate.minusDays(
                        COMPLETION_TREND_DAYS - 1
                );

        List<AnalyticsResponse.CompletionTrend> trend =
                new ArrayList<>();

        /*
         * Cumulative completion count is calculated from
         * the beginning of the returned 30-day window.
         */
        long cumulativeCompleted = 0;

        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {

            long completedToday =
                    completedByDate.getOrDefault(
                            currentDate,
                            0L
                    );

            cumulativeCompleted += completedToday;

            trend.add(
                    new AnalyticsResponse.CompletionTrend(
                            currentDate.toString(),
                            completedToday,
                            cumulativeCompleted
                    )
            );

            currentDate =
                    currentDate.plusDays(1);
        }

        return trend;
    }

    private long countByStatus(
            List<Task> tasks,
            UUID statusId
    ) {
        return tasks.stream()
                .filter(task ->
                        statusId.equals(task.getStatusId()))
                .count();
    }

    private long countByPriority(
            List<Task> tasks,
            UUID priorityId
    ) {
        return tasks.stream()
                .filter(task ->
                        priorityId.equals(task.getPriorityId()))
                .count();
    }

    private boolean isOverdue(Task task) {

        if (task.getDueDate() == null) {
            return false;
        }

        if (DONE_STATUS_ID.equals(task.getStatusId())) {
            return false;
        }

        return task.getDueDate()
                .isBefore(LocalDate.now());
    }
}