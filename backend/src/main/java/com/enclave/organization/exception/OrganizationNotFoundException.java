package com.enclave.organization.exception;

import java.util.UUID;

/**
 * Thrown when an Organization cannot be found by its identifier.
 * Intended to be mapped to an HTTP 404 response by a global exception handler.
 */
public class OrganizationNotFoundException extends RuntimeException {

    public OrganizationNotFoundException(String message) {
        super(message);
    }

    public OrganizationNotFoundException(UUID organizationId) {
        super("Organization not found: " + organizationId);
    }
}