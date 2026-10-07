package com.enclave.dashboard.dto;

import java.util.List;

public class ManagerDashboardResponse {

    private int projectCount;

    private int taskCount;

    private int completedTaskCount;

    private int overdueTaskCount;

    private List<ProjectProgress> projects;

    private List<TeamWorkload> teamWorkload;

    private List<UrgentTask> urgentTasks;


    public ManagerDashboardResponse() {

    }


    public ManagerDashboardResponse(

            int projectCount,

            int taskCount,

            int completedTaskCount,

            int overdueTaskCount,

            List<ProjectProgress> projects,

            List<TeamWorkload> teamWorkload,

            List<UrgentTask> urgentTasks

    ) {

        this.projectCount = projectCount;

        this.taskCount = taskCount;

        this.completedTaskCount = completedTaskCount;

        this.overdueTaskCount = overdueTaskCount;

        this.projects = projects;

        this.teamWorkload = teamWorkload;

        this.urgentTasks = urgentTasks;

    }


    public int getProjectCount() {

        return projectCount;

    }


    public void setProjectCount(int projectCount) {

        this.projectCount = projectCount;

    }


    public int getTaskCount() {

        return taskCount;

    }


    public void setTaskCount(int taskCount) {

        this.taskCount = taskCount;

    }


    public int getCompletedTaskCount() {

        return completedTaskCount;

    }


    public void setCompletedTaskCount(
            int completedTaskCount
    ) {

        this.completedTaskCount =
                completedTaskCount;

    }


    public int getOverdueTaskCount() {

        return overdueTaskCount;

    }


    public void setOverdueTaskCount(
            int overdueTaskCount
    ) {

        this.overdueTaskCount =
                overdueTaskCount;

    }


    public List<ProjectProgress> getProjects() {

        return projects;

    }


    public void setProjects(
            List<ProjectProgress> projects
    ) {

        this.projects = projects;

    }


    public List<TeamWorkload> getTeamWorkload() {

        return teamWorkload;

    }


    public void setTeamWorkload(
            List<TeamWorkload> teamWorkload
    ) {

        this.teamWorkload = teamWorkload;

    }


    public List<UrgentTask> getUrgentTasks() {

        return urgentTasks;

    }


    public void setUrgentTasks(
            List<UrgentTask> urgentTasks
    ) {

        this.urgentTasks = urgentTasks;

    }


    /*
     * ==========================================
     * PROJECT PROGRESS
     * ==========================================
     */

    public static class ProjectProgress {

        private String projectId;

        private String projectName;

        private int progress;


        public ProjectProgress() {

        }


        public ProjectProgress(

                String projectId,

                String projectName,

                int progress

        ) {

            this.projectId = projectId;

            this.projectName = projectName;

            this.progress = progress;

        }


        public String getProjectId() {

            return projectId;

        }


        public void setProjectId(
                String projectId
        ) {

            this.projectId = projectId;

        }


        public String getProjectName() {

            return projectName;

        }


        public void setProjectName(
                String projectName
        ) {

            this.projectName = projectName;

        }


        public int getProgress() {

            return progress;

        }


        public void setProgress(
                int progress
        ) {

            this.progress = progress;

        }

    }


    /*
     * ==========================================
     * TEAM WORKLOAD
     * ==========================================
     */

    public static class TeamWorkload {

        private String userId;

        private String userName;

        private int totalTasks;

        private int completedTasks;

        private int pendingTasks;


        public TeamWorkload() {

        }


        public TeamWorkload(

                String userId,

                String userName,

                int totalTasks,

                int completedTasks,

                int pendingTasks

        ) {

            this.userId = userId;

            this.userName = userName;

            this.totalTasks = totalTasks;

            this.completedTasks =
                    completedTasks;

            this.pendingTasks =
                    pendingTasks;

        }


        public String getUserId() {

            return userId;

        }


        public void setUserId(
                String userId
        ) {

            this.userId = userId;

        }


        public String getUserName() {

            return userName;

        }


        public void setUserName(
                String userName
        ) {

            this.userName = userName;

        }


        public int getTotalTasks() {

            return totalTasks;

        }


        public void setTotalTasks(
                int totalTasks
        ) {

            this.totalTasks = totalTasks;

        }


        public int getCompletedTasks() {

            return completedTasks;

        }


        public void setCompletedTasks(
                int completedTasks
        ) {

            this.completedTasks =
                    completedTasks;

        }


        public int getPendingTasks() {

            return pendingTasks;

        }


        public void setPendingTasks(
                int pendingTasks
        ) {

            this.pendingTasks =
                    pendingTasks;

        }

    }


    /*
     * ==========================================
     * URGENT TASK
     * ==========================================
     */

    public static class UrgentTask {

        private String taskId;

        private String projectId;

        private String projectName;

        private String taskTitle;

        private String assignedTo;

        private String dueDate;

        private String status;

        private String priority;


        public UrgentTask() {

        }


        public UrgentTask(

                String taskId,

                String projectId,

                String projectName,

                String taskTitle,

                String assignedTo,

                String dueDate,

                String status,

                String priority

        ) {

            this.taskId = taskId;

            this.projectId = projectId;

            this.projectName =
                    projectName;

            this.taskTitle =
                    taskTitle;

            this.assignedTo =
                    assignedTo;

            this.dueDate =
                    dueDate;

            this.status =
                    status;

            this.priority =
                    priority;

        }


        public String getTaskId() {

            return taskId;

        }


        public void setTaskId(
                String taskId
        ) {

            this.taskId = taskId;

        }


        public String getProjectId() {

            return projectId;

        }


        public void setProjectId(
                String projectId
        ) {

            this.projectId = projectId;

        }


        public String getProjectName() {

            return projectName;

        }


        public void setProjectName(
                String projectName
        ) {

            this.projectName =
                    projectName;

        }


        public String getTaskTitle() {

            return taskTitle;

        }


        public void setTaskTitle(
                String taskTitle
        ) {

            this.taskTitle =
                    taskTitle;

        }


        public String getAssignedTo() {

            return assignedTo;

        }


        public void setAssignedTo(
                String assignedTo
        ) {

            this.assignedTo =
                    assignedTo;

        }


        public String getDueDate() {

            return dueDate;

        }


        public void setDueDate(
                String dueDate
        ) {

            this.dueDate =
                    dueDate;

        }


        public String getStatus() {

            return status;

        }


        public void setStatus(
                String status
        ) {

            this.status = status;

        }


        public String getPriority() {

            return priority;

        }


        public void setPriority(
                String priority
        ) {

            this.priority =
                    priority;

        }

    }

}