
package com.enclave.audit.service;

import com.enclave.audit.entity.AuditLog;
import com.enclave.audit.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getOrganizationAuditLogs(UUID organizationId) {
        return auditLogRepository
                .findByOrganizationIdOrderByCreatedAtDesc(organizationId);
    }

    @Transactional
    public AuditLog recordAction(
            UUID organizationId,
            UUID actorId,
            String action,
            String entityType,
            UUID entityId,
            String details
    ) {
        AuditLog auditLog = new AuditLog();

        auditLog.setOrganizationId(organizationId);
        auditLog.setActorId(actorId);
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setDetails(details);

        return auditLogRepository.save(auditLog);
    }
}
