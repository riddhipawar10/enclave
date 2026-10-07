package com.enclave.organization.exception;

import java.util.UUID;

public class MemberAlreadyExistsException extends RuntimeException {

    public MemberAlreadyExistsException(UUID organizationId, UUID userId) {
        super(
            "User " + userId +
            " is already a member of organization " +
            organizationId
        );
    }
}