import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  getMyOrganizations,
  getOrganizationMembers,
  removeMember,
  updateMemberRole,
} from "../../services/organizationService";

import { getAssignableRoles } from "../../services/roleService";

import "./MyTeam.css";

function MyTeam() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Organization ID passed from Organization Details page.
  // Example:
  // /team?organizationId=5ad42782-6173-4571-b76a-5c6c41a7b630
  const organizationIdFromUrl =
    searchParams.get("organizationId");

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState("");

  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [isLoadingOrganizations, setIsLoadingOrganizations] =
    useState(true);

  const [isLoadingMembers, setIsLoadingMembers] =
    useState(false);

  const [isLoadingRoles, setIsLoadingRoles] =
    useState(true);

  const [removingUserId, setRemovingUserId] =
    useState("");

  const [updatingUserId, setUpdatingUserId] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // Load organizations
  // =====================================================

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setError("");

        const data = await getMyOrganizations();

        setOrganizations(data);

        if (data.length > 0) {
          /*
           * If My Team was opened from an organization details
           * page, select that organization automatically.
           *
           * Otherwise, fall back to the first organization.
           */
          const organizationFromUrl = data.find(
            (organization) =>
              organization.id === organizationIdFromUrl
          );

          if (organizationFromUrl) {
            setSelectedOrganizationId(
              organizationFromUrl.id
            );
          } else {
            setSelectedOrganizationId(data[0].id);
          }
        } else {
          setSelectedOrganizationId("");
        }
      } catch (err) {
        console.error(
          "Failed to load organizations:",
          err
        );

        setError(
          "Failed to load your organizations."
        );
      } finally {
        setIsLoadingOrganizations(false);
      }
    };

    loadOrganizations();
  }, [organizationIdFromUrl]);

  // =====================================================
  // Load roles
  // =====================================================

  useEffect(() => {
    if (!selectedOrganizationId) {
      setRoles([]);
      setIsLoadingRoles(false);
      return;
    }

    const loadRoles = async () => {
      try {
        setError("");
        setIsLoadingRoles(true);

        const data = await getAssignableRoles(
          selectedOrganizationId
        );

        setRoles(data);
      } catch (err) {
        console.error(
          "Failed to load roles:",
          err
        );

        if (err.response?.status === 403) {
          setError(
            "You do not have permission to manage team members."
          );
        } else {
          setError(
            "Failed to load available roles."
          );
        }
      } finally {
        setIsLoadingRoles(false);
      }
    };

    loadRoles();
  }, [selectedOrganizationId]);

  // =====================================================
  // Load organization members
  // =====================================================

  useEffect(() => {
    if (!selectedOrganizationId) {
      setMembers([]);
      return;
    }

    const loadMembers = async () => {
      try {
        setError("");
        setSuccess("");
        setIsLoadingMembers(true);

        const data = await getOrganizationMembers(
          selectedOrganizationId
        );

        setMembers(data);
      } catch (err) {
        console.error(
          "Failed to load team members:",
          err
        );

        if (err.response?.status === 403) {
          setError(
            "You do not have permission to view this organization's team."
          );
        } else {
          setError(
            "Failed to load team members."
          );
        }
      } finally {
        setIsLoadingMembers(false);
      }
    };

    loadMembers();
  }, [selectedOrganizationId]);

  // =====================================================
  // Organization change
  // =====================================================

  const handleOrganizationChange = (event) => {
    const organizationId = event.target.value;

    setSelectedOrganizationId(organizationId);

    setMembers([]);
    setError("");
    setSuccess("");

    /*
     * Update the URL as well so the selected organization
     * remains represented in the page URL.
     */
    navigate(
      `/team?organizationId=${organizationId}`,
      { replace: true }
    );
  };

  // =====================================================
  // Navigate to Add Member page
  // =====================================================

  const handleAddMember = () => {
    navigate(
      `/team/add?organizationId=${selectedOrganizationId}`
    );
  };

  // =====================================================
  // Update member role
  // =====================================================

  const handleRoleChange = async (
    userId,
    roleId
  ) => {
    if (!roleId) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      setUpdatingUserId(userId);

      const updatedMember =
        await updateMemberRole(
          selectedOrganizationId,
          userId,
          roleId
        );

      setMembers((currentMembers) =>
        currentMembers.map((member) =>
          member.userId === userId
            ? updatedMember
            : member
        )
      );

      setSuccess(
        "Member role updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to update member role:",
        err
      );

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to manage team members."
        );
      } else {
        setError(
          "Failed to update member role."
        );
      }
    } finally {
      setUpdatingUserId("");
    }
  };

  // =====================================================
  // Remove member
  // =====================================================

  const handleRemoveMember = async (
    userId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this member from the organization?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      setRemovingUserId(userId);

      await removeMember(
        selectedOrganizationId,
        userId
      );

      setMembers((currentMembers) =>
        currentMembers.filter(
          (member) =>
            member.userId !== userId
        )
      );

      setSuccess(
        "Member removed successfully."
      );
    } catch (err) {
      console.error(
        "Failed to remove member:",
        err
      );

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to remove team members."
        );
      } else {
        setError(
          "Failed to remove team member."
        );
      }
    } finally {
      setRemovingUserId("");
    }
  };

  // =====================================================
  // Helpers
  // =====================================================

  const getMemberName = (member) => {
    const fullName = [
      member.firstName,
      member.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    return fullName || "Unnamed User";
  };

  const formatJoinedDate = (joinedAt) => {
    if (!joinedAt) {
      return "—";
    }

    const date = new Date(joinedAt);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString();
  };

  // =====================================================
  // Render
  // =====================================================

  return (
    <div className="my-team-page">
      <div className="my-team-header">
        <div>
          <h1>My Team</h1>

          <p>
            View and manage members of your
            organization.
          </p>
        </div>
      </div>

      {error && (
        <div className="my-team-message my-team-error">
          {error}
        </div>
      )}

      {success && (
        <div className="my-team-message my-team-success">
          {success}
        </div>
      )}

      {/* =================================================
          Organization
      ================================================= */}

      <section className="my-team-card">
        <div className="my-team-card-header">
          <div>
            <h2>Organization</h2>

            <p>
              Select an organization to view its
              team members.
            </p>
          </div>
        </div>

        {isLoadingOrganizations ? (
          <p className="my-team-loading">
            Loading organizations...
          </p>
        ) : organizations.length === 0 ? (
          <p className="my-team-empty">
            You are not currently a member of any
            organization.
          </p>
        ) : (
          <div className="my-team-selector">
            <label htmlFor="team-organization">
              Organization
            </label>

            <select
              id="team-organization"
              value={selectedOrganizationId}
              onChange={
                handleOrganizationChange
              }
            >
              {organizations.map(
                (organization) => (
                  <option
                    key={organization.id}
                    value={organization.id}
                  >
                    {organization.name}
                  </option>
                )
              )}
            </select>
          </div>
        )}
      </section>

      {/* =================================================
          Team Members
      ================================================= */}

      {selectedOrganizationId && (
        <section className="my-team-card">
          <div className="my-team-card-header my-team-members-header">
            <div>
              <h2>Team Members</h2>

              <p>
                {members.length}{" "}
                {members.length === 1
                  ? "member"
                  : "members"}{" "}
                in this organization.
              </p>
            </div>

            <button
              type="button"
              className="my-team-add-button"
              onClick={handleAddMember}
            >
              + Add Member
            </button>
          </div>

          {isLoadingMembers ? (
            <p className="my-team-loading">
              Loading team members...
            </p>
          ) : members.length === 0 ? (
            <p className="my-team-empty">
              No team members found.
            </p>
          ) : (
            <div className="my-team-table-wrapper">
              <table className="my-team-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div className="my-team-member">
                          <div className="my-team-avatar">
                            {getMemberName(
                              member
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {getMemberName(
                                member
                              )}
                            </strong>
                          </div>
                        </div>
                      </td>

                      <td>
                        {member.email || "—"}
                      </td>

                      <td>
                        <select
                          value={
                            member.roleId || ""
                          }
                          disabled={
                            isLoadingRoles ||
                            updatingUserId ===
                              member.userId
                          }
                          onChange={(event) =>
                            handleRoleChange(
                              member.userId,
                              event.target.value
                            )
                          }
                        >
                          {isLoadingRoles ? (
                            <option value="">
                              Loading roles...
                            </option>
                          ) : roles.length === 0 ? (
                            <option value="">
                              No roles available
                            </option>
                          ) : (
                            <>
                              <option value="">
                                Select role
                              </option>

                              {roles.map(
                                (role) => (
                                  <option
                                    key={role.id}
                                    value={role.id}
                                  >
                                    {role.name}
                                  </option>
                                )
                              )}
                            </>
                          )}
                        </select>
                      </td>

                      <td>
                        {formatJoinedDate(
                          member.joinedAt
                        )}
                      </td>

                      <td>
                        <span
                          className={
                            member.active
                              ? "my-team-status active"
                              : "my-team-status inactive"
                          }
                        >
                          {member.active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="my-team-remove-button"
                          disabled={
                            removingUserId ===
                            member.userId
                          }
                          onClick={() =>
                            handleRemoveMember(
                              member.userId
                            )
                          }
                        >
                          {removingUserId ===
                          member.userId
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default MyTeam;