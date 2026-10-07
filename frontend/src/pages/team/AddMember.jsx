import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyOrganizations,
  findMemberCandidate,
  addMember,
} from "../../services/organizationService";

import { getAssignableRoles } from "../../services/roleService";

import "./AddMember.css";

function AddMember() {
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [organizationId, setOrganizationId] = useState("");

  const [email, setEmail] = useState("");
  const [candidate, setCandidate] = useState(null);

  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setError("");

        const data = await getMyOrganizations();

        setOrganizations(data);

        if (data.length > 0) {
          setOrganizationId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load organizations:", err);
        setError("Failed to load organizations.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrganizations();
  }, []);

  useEffect(() => {
    const loadRoles = async () => {
      if (!organizationId) {
        setRoles([]);
        setRoleId("");
        return;
      }

      try {
        setError("");

        const data = await getAssignableRoles(organizationId);

        setRoles(data);

        if (data.length > 0) {
          setRoleId(data[0].id);
        } else {
          setRoleId("");
        }
      } catch (err) {
        console.error("Failed to load assignable roles:", err);

        setRoles([]);
        setRoleId("");

        if (err.response?.status === 403) {
          setError(
            "You do not have permission to add members to this organization."
          );
        } else {
          setError("Failed to load available roles.");
        }
      }
    };

    loadRoles();
  }, [organizationId]);

  const handleFindMember = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setCandidate(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!organizationId) {
      setError("Please select an organization.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter an email address.");
      return;
    }

    try {
      setIsSearching(true);

      const result = await findMemberCandidate(
        organizationId,
        trimmedEmail
      );

      setCandidate(result);
    } catch (err) {
      console.error("Failed to find member:", err);

      /*
       * 409 = User already belongs to this organization.
       */
      if (err.response?.status === 409) {
        setError(
          "This user is already a member of this organization."
        );
      }

      /*
       * 403 = Current user does not have permission.
       */
      else if (err.response?.status === 403) {
        setError(
          "You do not have permission to manage members in this organization."
        );
      }

      /*
       * 404 = User does not exist / is not active.
       */
      else if (err.response?.status === 404) {
        setError(
          "No active user was found with that email address."
        );
      }

      /*
       * If the backend provides a useful message, display it.
       */
      else if (err.response?.data?.message) {
        setError(err.response.data.message);
      }

      /*
       * Generic fallback.
       */
      else {
        setError(
          "Unable to find a user with that email address."
        );
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async () => {
    if (!candidate) {
      setError("Please find a member first.");
      return;
    }

    if (!roleId) {
      setError("Please select a role.");
      return;
    }

    try {
      setIsAdding(true);
      setError("");
      setSuccess("");

      await addMember(organizationId, {
        userId: candidate.id,
        roleId,
      });

      setSuccess("Member added successfully.");

      setTimeout(() => {
        navigate("/team");
      }, 800);
    } catch (err) {
      console.error("Failed to add member:", err);

      if (err.response?.status === 409) {
        setError(
          "This user is already a member of this organization."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to add members to this organization."
        );
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to add member.");
      }
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="add-member-page">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="add-member-page">
      <div className="add-member-container">

        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/team")}
        >
          &larr; Back to My Team
        </button>

        <div className="add-member-header">
          <div>
            <h1>Add Member</h1>

            <p>
              Add an existing Enclave user to your organization and
              assign their role.
            </p>
          </div>
        </div>

        <div className="add-member-card">

          <div className="form-section">
            <h2>Member Details</h2>

            <p className="section-description">
              Select an organization and search for the user by email.
            </p>

            <div className="form-group">
              <label htmlFor="organization">
                Organization
              </label>

              <select
                id="organization"
                value={organizationId}
                onChange={(event) => {
                  setOrganizationId(event.target.value);
                  setCandidate(null);
                  setRoleId("");
                  setSuccess("");
                  setError("");
                }}
              >
                <option value="">
                  Select organization
                </option>

                {organizations.map((organization) => (
                  <option
                    key={organization.id}
                    value={organization.id}
                  >
                    {organization.name}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleFindMember}>
              <div className="form-group">
                <label htmlFor="email">
                  Email Address
                </label>

                <div className="email-search-row">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setCandidate(null);
                      setSuccess("");
                      setError("");
                    }}
                    placeholder="Enter member email"
                  />

                  <button
                    type="submit"
                    className="find-member-button"
                    disabled={isSearching}
                  >
                    {isSearching
                      ? "Searching..."
                      : "Find Member"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {candidate && (
            <div className="candidate-card">
              <div className="candidate-avatar">
                {(
                  candidate.firstName?.[0] ||
                  candidate.lastName?.[0] ||
                  candidate.email?.[0] ||
                  "?"
                ).toUpperCase()}
              </div>

              <div className="candidate-info">
                <h3>
                  {[
                    candidate.firstName,
                    candidate.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ") || "User"}
                </h3>

                <p>{candidate.email}</p>
              </div>

              <div className="candidate-found">
                User found
              </div>
            </div>
          )}

          {candidate && (
            <div className="form-section role-section">
              <h2>Assign Role</h2>

              <p className="section-description">
                Choose the role this member should have in the
                organization.
              </p>

              <div className="form-group">
                <label htmlFor="role">
                  Organization Role
                </label>

                <select
                  id="role"
                  value={roleId}
                  onChange={(event) =>
                    setRoleId(event.target.value)
                  }
                >
                  <option value="">
                    Select role
                  </option>

                  {roles.map((role) => (
                    <option
                      key={role.id}
                      value={role.id}
                    >
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {error && (
            <div className="add-member-message error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="add-member-message success-message">
              {success}
            </div>
          )}

          <div className="add-member-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/team")}
            >
              Cancel
            </button>

            <button
              type="button"
              className="confirm-add-member-button"
              onClick={handleAddMember}
              disabled={
                !candidate ||
                !roleId ||
                isAdding
              }
            >
              {isAdding
                ? "Adding Member..."
                : "Add Member"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AddMember;