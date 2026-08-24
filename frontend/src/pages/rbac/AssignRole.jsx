import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useRBAC from "../../context/useRBAC";
import { getOrganizationMembers, updateMemberRole } from "../../services/organizationService";
import { getAllRoles } from "../../services/rbacService";
import "./AssignRole.css";

/**
 * AssignRole
 *
 * Assigns a role to an existing organization member. Reuses
 * organizationService.js directly (getOrganizationMembers,
 * updateMemberRole) rather than duplicating that logic here - only
 * getAllRoles comes from rbacService.js, since roles themselves are
 * RBAC's responsibility.
 *
 * Route: /organizations/:organizationId/assign-role
 */
function AssignRole() {
  const { organizationId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useRBAC();

  const canAssignRoles = hasPermission("MANAGE_MEMBERS");

  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [membersData, rolesData] = await Promise.all([
          getOrganizationMembers(organizationId),
          getAllRoles(),
        ]);
        setMembers(membersData);
        setRoles(rolesData);
      } catch {
        setError("Failed to load members or roles. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [organizationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!selectedMemberId || !selectedRoleId) {
      setSubmitError("Please select both a member and a role.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMemberRole(organizationId, selectedMemberId, selectedRoleId);
      setSubmitSuccess(true);
      setSelectedMemberId("");
      setSelectedRoleId("");

      // Refresh member list so roleName shown below updates.
      const updatedMembers = await getOrganizationMembers(organizationId);
      setMembers(updatedMembers);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          "Failed to assign role. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading members and roles..." />;
  }

  if (!canAssignRoles) {
    return (
      <div className="assign-role-page">
        <p className="assign-role-denied">
          You do not have permission to assign roles to members.
        </p>
        <button onClick={() => navigate(`/organizations/${organizationId}`)}>
          Back to Organization
        </button>
      </div>
    );
  }

  return (
    <div className="assign-role-page">
      <button
        className="assign-role-back-button"
        onClick={() => navigate(`/organizations/${organizationId}/members`)}
      >
        &larr; Back to Members
      </button>

      <h2>Assign Role to Member</h2>

      {error && <ErrorMessage message={error} />}
      {submitError && <ErrorMessage message={submitError} />}
      {submitSuccess && (
        <p className="assign-role-success">Role assigned successfully.</p>
      )}

      <form className="assign-role-form" onSubmit={handleSubmit} noValidate>
        <div className="assign-role-field">
          <label htmlFor="member-select">Member</label>
          <select
            id="member-select"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            disabled={isSubmitting || members.length === 0}
          >
            <option value="">-- Select a member --</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.firstName} {member.lastName} ({member.email}) - currently{" "}
                {member.roleName}
              </option>
            ))}
          </select>
          {members.length === 0 && (
            <span className="assign-role-hint">No members found in this organization.</span>
          )}
        </div>

        <div className="assign-role-field">
          <label htmlFor="role-select">Role</label>
          <select
            id="role-select"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            disabled={isSubmitting || roles.length === 0}
          >
            <option value="">-- Select a role --</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {roles.length === 0 && (
            <span className="assign-role-hint">No roles found in the system.</span>
          )}
        </div>

        <button type="submit" className="assign-role-submit-button" disabled={isSubmitting}>
          {isSubmitting ? "Assigning..." : "Assign Role"}
        </button>
      </form>
    </div>
  );
}

export default AssignRole;