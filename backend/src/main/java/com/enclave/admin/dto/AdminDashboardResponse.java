package com.enclave.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {

    private long totalMembers;

    private long activeMembers;

    private long managers;

    private long teamMembers;

    private long totalProjects;

    private long activeProjects;

    private long completedProjects;

    private long totalTasks;

    private long completedTasks;

    private long overdueTasks;

    private double completionRate;
}