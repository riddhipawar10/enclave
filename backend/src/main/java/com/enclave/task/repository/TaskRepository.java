package com.enclave.task.repository;

import com.enclave.project.entity.Project;
import com.enclave.task.entity.Task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByProjectIdOrderByPositionAsc(
            UUID projectId
    );

    @Query("""
        SELECT t
        FROM Task t
        WHERE t.projectId IN (
            SELECT p.id
            FROM Project p
            WHERE p.organizationId = :organizationId
        )
    """)
    List<Task> findByOrganizationId(
            @Param("organizationId") UUID organizationId
    );
}