package com.enclave.analytics.controller;

import com.enclave.analytics.dto.AnalyticsResponse;
import com.enclave.analytics.service.AnalyticsService;
import com.enclave.rbac.security.RequirePermission;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(
        "/api/organizations/{organizationId}/projects/{projectId}/analytics"
)
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(
            AnalyticsService analyticsService
    ) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    @RequirePermission("VIEW_TASK")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("projectId") UUID projectId
    ) {

        return ResponseEntity.ok(
                analyticsService.getProjectAnalytics(projectId)
        );
    }
}