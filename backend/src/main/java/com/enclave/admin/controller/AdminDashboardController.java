
package com.enclave.admin.controller;

import com.enclave.admin.dto.AdminDashboardResponse;
import com.enclave.admin.service.AdminDashboardService;
import com.enclave.auth.entity.User;
import com.enclave.organization.repository.OrganizationMemberRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;
    private final OrganizationMemberRepository organizationMemberRepository;

    public AdminDashboardController(
            AdminDashboardService adminDashboardService,
            OrganizationMemberRepository organizationMemberRepository
    ) {
        this.adminDashboardService = adminDashboardService;
        this.organizationMemberRepository = organizationMemberRepository;
    }

    @GetMapping("/{organizationId}")
    public ResponseEntity<AdminDashboardResponse> getDashboard(
            @PathVariable UUID organizationId,
            Authentication authentication
    ) {
        if (authentication == null
                || !(authentication.getPrincipal() instanceof User user)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication is required."
            );
        }

        boolean isActiveAdmin =
                organizationMemberRepository
                        .findByOrganization_IdAndUser_Id(
                                organizationId,
                                user.getId()
                        )
                        .filter(OrganizationMember -> OrganizationMember.isActive())
                        .filter(OrganizationMember -> OrganizationMember.getRole() != null)
                        .filter(OrganizationMember ->
                                "ADMIN".equals(OrganizationMember.getRole().getName()))
                        .isPresent();

        if (!isActiveAdmin) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You must be an active Admin of this organization."
            );
        }

        AdminDashboardResponse response =
                adminDashboardService.getDashboard(organizationId);

        return ResponseEntity.ok(response);
    }
}