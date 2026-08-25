import  { useState } from "react";
import { addMember } from "../../services/organizationService";
import ErrorMessage from "../common/ErrorMessage";
import "./InviteMemberForm.css";

const FALLBACK_ROLES = [
  { id: "placeholder-admin", name: "Admin" },
  { id: "placeholder-member", name: "Member" },
];

// Basic UUID v4-ish format check, just to catch obvious typos before hitting the API.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function InviteMemberForm({ organizationId, onMemberAdded, availableRoles }) {
  const roles = availableRoles && availableRoles.length > 0 ? availableRoles : FALLBACK_ROLES;

  const [userId, setUserId] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.id || "");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const validate = () => {
    const newErrors = {};
    if (!userId.trim()) {
      newErrors.userId = "User ID is required.";
    } else if (!UUID_PATTERN.test(userId.trim())) {
      newErrors.userId = "User ID must be a valid UUID.";
    }
    if (!roleId) {
      newErrors.roleId = "Please select a role.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setSubmitError("");

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const newMember = await addMember(organizationId, { userId: userId.trim(), roleId });
      setSuccessMessage("Member added successfully.");
      setUserId("");
      setRoleId(roles[0]?.id || "");
      if (onMemberAdded) {
        onMemberAdded(newMember);
      }
    } catch  {
      setSubmitError("Failed to add member. Check the User ID and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="invite-member-form" onSubmit={handleSubmit} noValidate>
      {successMessage && <p className="invite-member-form-success">{successMessage}</p>}
      <ErrorMessage message={submitError} />

      <div className="invite-member-form-row">
        <div className="invite-member-form-field">
          <input
            type="text"
            placeholder="User ID (UUID)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="invite-member-input"
            disabled={isSubmitting}
            aria-invalid={!!errors.userId}
          />
          <ErrorMessage message={errors.userId} />
        </div>

        <div className="invite-member-form-field">
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="invite-member-select"
            disabled={isSubmitting}
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <ErrorMessage message={errors.roleId} />
        </div>

        <button type="submit" className="invite-member-button" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Member"}
        </button>
      </div>
    </form>
  );
}

export default InviteMemberForm;