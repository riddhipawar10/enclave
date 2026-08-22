package com.enclave.organization.exception;

import java.util.UUID;

/**
 * Thrown when a membership (a specific user's membership within a specific
 * organization) cannot be found.
 * Intended to be mapped to an HTTP 404 response by a global exception handler.
 */
public class MemberNotFoundException extends RuntimeException {

    public MemberNotFoundException(String message) {
        super(message);
    }

    public MemberNotFoundException(UUID organizationId, UUID userId) {
        super("Membership not found for user " + userId + " in organization " + organizationId);
    }
}