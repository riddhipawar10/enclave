package com.enclave.dashboard.controller;

import com.enclave.dashboard.dto.ManagerDashboardResponse;
import com.enclave.dashboard.service.ManagerDashboardService;
import com.enclave.rbac.security.RequirePermission;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ManagerDashboardService managerDashboardService;

    public DashboardController(
            ManagerDashboardService managerDashboardService
    ) {
        this.managerDashboardService = managerDashboardService;
    }

    @GetMapping("/manager/{organizationId}")
    @RequirePermission("VIEW_PROJECT")
    public ResponseEntity<ManagerDashboardResponse> getManagerDashboard(
            @PathVariable("organizationId") UUID organizationId
    ) {

        ManagerDashboardResponse response =
                managerDashboardService.getDashboard(
                        organizationId
                );

        return ResponseEntity.ok(response);
    }
}