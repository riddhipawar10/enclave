package com.enclave.admin.service;

import com.enclave.admin.dto.AdminDashboardResponse;
import com.enclave.organization.entity.OrganizationMember;
import com.enclave.organization.repository.OrganizationMemberRepository;
import com.enclave.project.entity.Project;
import com.enclave.project.repository.ProjectRepository;
import com.enclave.task.entity.Task;
import com.enclave.task.repository.TaskRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class AdminDashboardService {

private final OrganizationMemberRepository organizationMemberRepository;
private final ProjectRepository projectRepository;
private final TaskRepository taskRepository;

public AdminDashboardService(
        OrganizationMemberRepository organizationMemberRepository,
        ProjectRepository projectRepository,
        TaskRepository taskRepository
) {
    this.organizationMemberRepository = organizationMemberRepository;
    this.projectRepository = projectRepository;
    this.taskRepository = taskRepository;
}

public AdminDashboardResponse getDashboard(UUID organizationId) {

    // Organization members
    List<OrganizationMember> members =
            organizationMemberRepository.findByOrganization_Id(organizationId);

    long totalMembers = members.size();

    long activeMembers = members.stream()
            .filter(OrganizationMember::isActive)
            .count();

    long managers = members.stream()
            .filter(OrganizationMember::isActive)
            .filter(member -> member.getRole() != null
                    && "MANAGER".equals(member.getRole().getName()))
            .count();

    long teamMembers = members.stream()
            .filter(OrganizationMember::isActive)
            .filter(member -> member.getRole() != null
                    && "TEAM_MEMBER".equals(member.getRole().getName()))
            .count();

    // Organization projects
    List<Project> projects =
            projectRepository.findByOrganizationIdAndArchivedFalse(organizationId);

    long activeProjects = projects.size();

    // Project completion cannot be calculated accurately until
    // the Project entity has an explicit completion status.
    long completedProjects = 0;

    // Organization tasks
    List<Task> tasks = taskRepository.findByOrganizationId(organizationId);

    long totalTasks = tasks.size();

    long completedTasks = tasks.stream()
            .filter(task -> task.getCompletedAt() != null)
            .count();

    LocalDate today = LocalDate.now();

    long overdueTasks = tasks.stream()
            .filter(task -> task.getCompletedAt() == null)
            .filter(task -> task.getDueDate() != null)
            .filter(task -> task.getDueDate().isBefore(today))
            .count();

    double completionRate = totalTasks == 0
            ? 0.0
            : (completedTasks * 100.0) / totalTasks;

    return AdminDashboardResponse.builder()
            .totalMembers(totalMembers)
            .activeMembers(activeMembers)
            .managers(managers)
            .teamMembers(teamMembers)
            .totalProjects(projectRepository.countByOrganizationId(organizationId))
            .activeProjects(activeProjects)
            .completedProjects(completedProjects)
            .totalTasks(totalTasks)
            .completedTasks(completedTasks)
            .overdueTasks(overdueTasks)
            .completionRate(completionRate)
            .build();
}


}
