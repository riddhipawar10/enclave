
package com.enclave.audit.controller;

import com.enclave.audit.entity.AuditLog;
import com.enclave.audit.service.AuditLogService;
import com.enclave.rbac.security.RequirePermission;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations/{organizationId}/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @RequirePermission("VIEW_AUDIT_LOG")
    public ResponseEntity<List<AuditLog>> getOrganizationAuditLogs(
            @PathVariable("organizationId") UUID organizationId) {

        List<AuditLog> auditLogs =
                auditLogService.getOrganizationAuditLogs(organizationId);

        return ResponseEntity.ok(auditLogs);
    }
}
