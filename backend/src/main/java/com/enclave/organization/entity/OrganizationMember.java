package com.enclave.organization.entity;

import com.enclave.role.entity.Role;
import com.enclave.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity mapping for the existing "organization_members" table.
 * Junction entity linking a User to an Organization with a specific Role.
 * Schema is NOT managed by JPA (ddl-auto should be "validate" or "none").
 */
@Entity
@Table(
        name = "organization_members",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_organization_user",
                        columnNames = {"organization_id", "user_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OrganizationMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "organization_id",
            nullable = false,
            foreignKey = @jakarta.persistence.ForeignKey(name = "fk_org_members_organization")
    )
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @jakarta.persistence.ForeignKey(name = "fk_org_members_user")
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "role_id",
            nullable = false,
            foreignKey = @jakarta.persistence.ForeignKey(name = "fk_org_members_role")
    )
    private Role role;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;
}