package com.enclave.dashboard.service;

import com.enclave.dashboard.dto.ManagerDashboardResponse;
import com.enclave.organization.dto.OrganizationMemberResponse;
import com.enclave.organization.service.OrganizationService;
import com.enclave.project.entity.Project;
import com.enclave.project.service.ProjectService;
import com.enclave.task.entity.Task;
import com.enclave.task.service.TaskService;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ManagerDashboardService {

    private static final UUID DONE_STATUS_ID =
            UUID.fromString(
                    "ceceaeed-5a8f-494f-9005-8c7330eb4e35"
            );

    private static final UUID HIGH_PRIORITY_ID =
            UUID.fromString(
                    "ccb1a560-2cfe-4b5f-9fe3-d8af19196e55"
            );

    private static final UUID URGENT_PRIORITY_ID =
            UUID.fromString(
                    "17153d97-f8bc-4fc6-8b41-abf279b98152"
            );

    private final ProjectService projectService;

    private final TaskService taskService;

    private final OrganizationService organizationService;


    public ManagerDashboardService(

            ProjectService projectService,

            TaskService taskService,

            OrganizationService organizationService

    ) {

        this.projectService =
                projectService;

        this.taskService =
                taskService;

        this.organizationService =
                organizationService;

    }


    public ManagerDashboardResponse getDashboard(

            UUID organizationId

    ) {

        List<Project> projects =
                projectService.getActiveProjects(
                        organizationId
                );

        int projectCount =
                projects.size();

        int taskCount = 0;

        int completedTaskCount = 0;

        int overdueTaskCount = 0;


        List<ManagerDashboardResponse.ProjectProgress>
                projectProgress =
                new ArrayList<>();


        /*
         * All tasks from the organization's
         * active projects.
         */
        List<Task> allTasks =
                new ArrayList<>();


        LocalDate today =
                LocalDate.now();


        /*
         * ==========================================
         * PROJECTS + BASIC TASK STATISTICS
         * ==========================================
         */

        for (Project project : projects) {

            List<Task> tasks =
                    taskService.getTasksByProject(
                            project.getId()
                    );


            allTasks.addAll(tasks);


            int projectTaskCount =
                    tasks.size();

            int projectCompletedTaskCount =
                    0;


            for (Task task : tasks) {

                taskCount++;


                if (DONE_STATUS_ID.equals(
                        task.getStatusId()
                )) {

                    completedTaskCount++;

                    projectCompletedTaskCount++;

                }


                if (

                        task.getDueDate() != null

                                && task.getDueDate()
                                .isBefore(today)

                                && !DONE_STATUS_ID.equals(
                                        task.getStatusId()
                                )

                ) {

                    overdueTaskCount++;

                }

            }


            int progress = 0;


            if (projectTaskCount > 0) {

                progress =
                        (int) Math.round(

                                (
                                        projectCompletedTaskCount
                                                * 100.0
                                )
                                        / projectTaskCount

                        );

            }


            projectProgress.add(

                    new ManagerDashboardResponse.ProjectProgress(

                            project.getId().toString(),

                            project.getName(),

                            progress

                    )

            );

        }


        /*
         * ==========================================
         * TEAM WORKLOAD
         * ==========================================
         */

        List<OrganizationMemberResponse> members =
                organizationService.listOrganizationMembers(
                        organizationId
                );


        /*
         * Map each user to their task counts.
         */
        Map<UUID, Integer> totalTasksByUser =
                new HashMap<>();

        Map<UUID, Integer> completedTasksByUser =
                new HashMap<>();


        for (Task task : allTasks) {

            UUID assignedUserId =
                    task.getAssignedTo();


            if (assignedUserId == null) {

                continue;

            }


            totalTasksByUser.merge(
                    assignedUserId,
                    1,
                    Integer::sum
            );


            if (DONE_STATUS_ID.equals(
                    task.getStatusId()
            )) {

                completedTasksByUser.merge(
                        assignedUserId,
                        1,
                        Integer::sum
                );

            }

        }


        List<ManagerDashboardResponse.TeamWorkload>
                teamWorkload =
                new ArrayList<>();


        for (OrganizationMemberResponse member : members) {

            if (!member.isActive()) {

                continue;

            }


            UUID userId =
                    member.getUserId();


            int totalTasks =
                    totalTasksByUser.getOrDefault(
                            userId,
                            0
                    );


            int completedTasks =
                    completedTasksByUser.getOrDefault(
                            userId,
                            0
                    );


            int pendingTasks =
                    totalTasks - completedTasks;


            String userName =
                    (
                            member.getFirstName()
                                    + " "
                                    + member.getLastName()
                    ).trim();


            if (userName.isBlank()) {

                userName =
                        member.getEmail();

            }


            teamWorkload.add(

                    new ManagerDashboardResponse.TeamWorkload(

                            userId.toString(),

                            userName,

                            totalTasks,

                            completedTasks,

                            pendingTasks

                    )

            );

        }


        /*
         * Show members with the highest
         * number of assigned tasks first.
         */
        teamWorkload.sort(

                Comparator.comparingInt(

                        ManagerDashboardResponse.TeamWorkload
                                ::getTotalTasks

                ).reversed()

        );


        /*
         * ==========================================
         * URGENT TASKS
         * ==========================================
         */

        Map<UUID, String> projectNames =
                new HashMap<>();


        for (Project project : projects) {

            projectNames.put(
                    project.getId(),
                    project.getName()
            );

        }


        List<ManagerDashboardResponse.UrgentTask>
                urgentTasks =
                new ArrayList<>();


        for (Task task : allTasks) {

            UUID priorityId =
                    task.getPriorityId();


            boolean isUrgentPriority =
                    HIGH_PRIORITY_ID.equals(priorityId)
                            || URGENT_PRIORITY_ID.equals(priorityId);


            if (!isUrgentPriority) {

                continue;

            }


            String assigneeName =
                    "Unassigned";


            if (task.getAssignedTo() != null) {

                for (
                        OrganizationMemberResponse member
                        : members
                ) {

                    if (

                            member.getUserId()
                                    .equals(
                                            task.getAssignedTo()
                                    )

                    ) {

                        String fullName =
                                (
                                        member.getFirstName()
                                                + " "
                                                + member.getLastName()
                                ).trim();


                        assigneeName =
                                fullName.isBlank()
                                        ? member.getEmail()
                                        : fullName;

                        break;

                    }

                }

            }


            String status =
                    getStatusName(
                            task.getStatusId()
                    );


            String priority =
                    getPriorityName(
                            task.getPriorityId()
                    );


            String dueDate =
                    task.getDueDate() == null
                            ? null
                            : task.getDueDate().toString();


            urgentTasks.add(

                    new ManagerDashboardResponse.UrgentTask(

                            task.getId().toString(),

                            task.getProjectId().toString(),

                            projectNames.get(
                                    task.getProjectId()
                            ),

                            task.getTitle(),

                            assigneeName,

                            dueDate,

                            status,

                            priority

                    )

            );

        }


        /*
         * Most urgent tasks first.
         *
         * 1. URGENT
         * 2. HIGH
         *
         * Then earliest due date.
         */
        urgentTasks.sort(

                Comparator
                        .comparingInt(

                                (ManagerDashboardResponse.UrgentTask task) ->

                                        "URGENT".equals(
                                                task.getPriority()
                                        )
                                                ? 0
                                                : 1

                        )
                        .thenComparing(

                                task -> task.getDueDate() == null
                                        ? "9999-12-31"
                                        : task.getDueDate()

                        )

        );


        /*
         * ==========================================
         * FINAL RESPONSE
         * ==========================================
         */

        return new ManagerDashboardResponse(

                projectCount,

                taskCount,

                completedTaskCount,

                overdueTaskCount,

                projectProgress,

                teamWorkload,

                urgentTasks

        );

    }


    private String getStatusName(
            UUID statusId
    ) {

        if (statusId == null) {

            return "UNKNOWN";

        }


        if (statusId.equals(
                UUID.fromString(
                        "ef25e678-91e9-4eb8-b8a1-fce9accd840f"
                )
        )) {

            return "TODO";

        }


        if (statusId.equals(
                UUID.fromString(
                        "cf8e322b-86ed-4597-8d4c-dd17dc917273"
                )
        )) {

            return "IN PROGRESS";

        }


        if (statusId.equals(
                UUID.fromString(
                        "4e33e701-a87f-439b-801c-083c4d36d87c"
                )
        )) {

            return "REVIEW";

        }


        if (statusId.equals(
                DONE_STATUS_ID
        )) {

            return "DONE";

        }


        return "UNKNOWN";

    }


    private String getPriorityName(
            UUID priorityId
    ) {

        if (priorityId == null) {

            return "UNKNOWN";

        }


        if (priorityId.equals(
                UUID.fromString(
                        "81f9c1a3-2793-4e4f-8a0c-51f5f79bf45a"
                )
        )) {

            return "LOW";

        }


        if (priorityId.equals(
                UUID.fromString(
                        "ff8a5fd3-a10d-4bee-a79e-3f579ce2e76b"
                )
        )) {

            return "MEDIUM";

        }


        if (priorityId.equals(
                HIGH_PRIORITY_ID
        )) {

            return "HIGH";

        }


        if (priorityId.equals(
                URGENT_PRIORITY_ID
        )) {

            return "URGENT";

        }


        return "UNKNOWN";

    }

}