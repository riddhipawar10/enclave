
import { useCallback, useEffect, useState } from "react";
import {
  getOrganizationInvitations,
  createOrganizationInvitation,
  getInvitationLink as fetchInvitationLink,
} from "../../services/organizationService";
import { getAssignableRoles } from "../../services/roleService";
import api from "../../services/api";
import "./AdminInvitations.css";

const ORGANIZATION_ID = "63ee3033-4624-42f9-81ee-142aeda8953f";

function AdminInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdToken, setCreatedToken] = useState("");
  const [verification, setVerification] = useState(null);
  const [verifyingId, setVerifyingId] = useState("");
  const [openingId, setOpeningId] = useState("");
  const [actionError, setActionError] = useState("");

  const getInvitationLink = (token) => {
    const url = new URL("/accept-invitation", window.location.origin);
    url.searchParams.set("token", token);
    return url.toString();
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess("Invitation link copied to clipboard.");
      setFormError("");
      setActionError("");
    } catch {
      setActionError(
        "Could not copy automatically. Select and copy the invitation link manually."
      );
    }
  };

  const loadInvitations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getOrganizationInvitations(ORGANIZATION_ID);
      setInvitations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load invitations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRoles = useCallback(async () => {
    setRolesLoading(true);
    setFormError("");

    try {
      const data = await getAssignableRoles(ORGANIZATION_ID);
      const availableRoles = Array.isArray(data) ? data : [];
      setRoles(availableRoles);

      setRoleId((current) =>
        availableRoles.some((role) => role.id === current)
          ? current
          : availableRoles.length > 0
            ? availableRoles[0].id
            : ""
      );
    } catch (err) {
      setRoles([]);
      setFormError(
        err.response?.data?.message ||
          "Unable to load assignable roles."
      );
    } finally {
      setRolesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvitations();
    loadRoles();
  }, [loadInvitations, loadRoles]);

  // Refresh from the backend when returning to this tab.
  useEffect(() => {
    const refreshWhenVisible = () => {
      if (!document.hidden) {
        loadInvitations();
      }
    };

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadInvitations]);

  const handleCreateInvitation = async (event) => {
    event.preventDefault();
    setFormError("");
    setSuccess("");
    setCreatedToken("");
    setActionError("");
    setVerification(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !roleId) {
      setFormError("Enter an email address and select a role.");
      return;
    }

    setCreating(true);

    try {
      const result = await createOrganizationInvitation(
        ORGANIZATION_ID,
        {
          email: normalizedEmail,
          roleId,
        }
      );

      const token = result.invitationToken || "";
      setSuccess(`Invitation created for ${result.email}.`);
      setCreatedToken(token);
      setEmail("");
      await loadInvitations();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Unable to create invitation. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleOpenInvitation = async (invitation) => {
    setActionError("");
    setOpeningId(invitation.id);

    // Open a blank tab immediately so the browser does not block
    // the new tab while the backend request is in progress.
    const newTab = window.open("about:blank", "_blank");

    if (!newTab) {
      setOpeningId("");
      setActionError(
        "Your browser blocked the new tab. Allow pop-ups and try again."
      );
      return;
    }

    try {
      const token = await fetchInvitationLink(
        ORGANIZATION_ID,
        invitation.id
      );

      if (typeof token !== "string" || !token.trim()) {
        throw new Error("The backend did not return an invitation token.");
      }

      const invitationUrl = new URL(
        getInvitationLink(token.trim())
      );

      // Only navigate to the existing invitation acceptance page.
      if (
        invitationUrl.origin !== window.location.origin ||
        invitationUrl.pathname !== "/accept-invitation"
      ) {
        throw new Error("The invitation link is invalid.");
      }

      newTab.opener = null;
      newTab.location.href = invitationUrl.toString();
    } catch (err) {
      newTab.close();

      const status = err.response?.status;
      let message =
        err.response?.data?.message ||
        err.message ||
        "Unable to open this invitation.";

      if (status === 404) {
        message = "Invitation not found.";
      } else if (status === 403) {
        message = "You do not have permission to open this invitation.";
      } else if (status === 409) {
        message = "This invitation is no longer pending.";
      } else if (status === 410) {
        message = "This invitation has expired.";
      }

      setActionError(message);
    } finally {
      setOpeningId("");
    }
  };

  const handleVerifyInvitation = async (invitation) => {
    setActionError("");
    setVerification(null);

    // The list API intentionally does not return tokens.
    // The creation response makes the token available only at creation time.
    const token =
      invitation.token ||
      (invitation.id === verification?.invitationId
        ? verification?.token
        : "");

    if (!token) {
      setActionError(
        "The token is not available in the invitation list. Use the link shown immediately after creating an invitation, or open the invitation to retrieve its link."
      );
      return;
    }

    setVerifyingId(invitation.id);

    try {
      const response = await api.get("/invitations/verify", {
        params: { token },
      });

      setVerification({
        invitationId: invitation.id,
        token,
        result: response.data,
        message: "Invitation verified successfully.",
        type: "success",
      });
    } catch (err) {
      const status = err.response?.status;
      let message =
        err.response?.data?.message ||
        "Unable to verify this invitation.";

      if (status === 404) {
        message = "Invitation not found. The token may be invalid.";
      } else if (status === 409) {
        message = "This invitation is no longer pending.";
      } else if (status === 410) {
        message = "This invitation has expired.";
      }

      setVerification({
        invitationId: invitation.id,
        token,
        message,
        type: "error",
      });
    } finally {
      setVerifyingId("");
    }
  };

  const filteredInvitations = invitations.filter((invitation) => {
    const matchesStatus =
      statusFilter === "ALL" || invitation.status === statusFilter;

    const matchesSearch = (invitation.email || "")
      .toLowerCase()
      .includes(search.toLowerCase().trim());

    return matchesStatus && matchesSearch;
  });

  return (
    <main className="admin-invitations">
      <div className="admin-invitations__header">
        <div>
          <h1>Invitations</h1>
          <p>View, create, verify, and track organization invitations.</p>
        </div>

        <button
          type="button"
          onClick={loadInvitations}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <section className="admin-invitations__create">
        <h2>Create an invitation</h2>

        <form onSubmit={handleCreateInvitation}>
          <label htmlFor="invitation-email">Email address</label>
          <input
            id="invitation-email"
            type="email"
            placeholder="person@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="invitation-role">Role</label>
          <select
            id="invitation-role"
            value={roleId}
            onChange={(event) => setRoleId(event.target.value)}
            disabled={rolesLoading || roles.length === 0}
            required
          >
            <option value="">
              {rolesLoading ? "Loading roles..." : "Select a role"}
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={creating || rolesLoading || !roleId}
          >
            {creating ? "Creating..." : "Create invitation"}
          </button>
        </form>

        {formError && (
          <p className="admin-invitations__error" role="alert">
            {formError}
          </p>
        )}

        {success && (
          <div className="admin-invitations__success" role="status">
            <p>{success}</p>

            {createdToken && (
              <>
                <p>
                  Share this link with the invitee. Anyone with the link may
                  be able to use it, so treat it as a secret.
                </p>

                <input
                  type="text"
                  readOnly
                  value={getInvitationLink(createdToken)}
                  aria-label="Invitation link"
                  onFocus={(event) => event.target.select()}
                />

                <button
                  type="button"
                  onClick={() =>
                    copyText(getInvitationLink(createdToken))
                  }
                >
                  Copy invitation link
                </button>

                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      getInvitationLink(createdToken),
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                  Open invitation page
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleVerifyInvitation({
                      id: "",
                      token: createdToken,
                    })
                  }
                >
                  Verify invitation
                </button>
              </>
            )}
          </div>
        )}
      </section>

      {actionError && (
        <p className="admin-invitations__error" role="alert">
          {actionError}
        </p>
      )}

      {verification && (
        <section
          className={
            verification.type === "success"
              ? "admin-invitations__success"
              : "admin-invitations__error"
          }
          role="status"
        >
          <h2>Invitation verification</h2>
          <p>{verification.message}</p>

          {verification.result && (
            <>
              <p>
                <strong>Email:</strong> {verification.result.email}
              </p>
              <p>
                <strong>Role:</strong>{" "}
                {roles.find(
                  (role) => role.id === verification.result.roleId
                )?.name || verification.result.roleId}
              </p>
              <p>
                <strong>Status:</strong> {verification.result.status}
              </p>
              <p>
                <strong>Expires:</strong>{" "}
                {verification.result.expiresAt
                  ? new Date(
                      verification.result.expiresAt
                    ).toLocaleString()
                  : "—"}
              </p>
            </>
          )}
        </section>
      )}

      <div className="admin-invitations__filters">
        <input
          type="search"
          placeholder="Search by email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search invitations by email"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter invitations by status"
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="admin-invitations__error">
          <p>{error}</p>
          <button type="button" onClick={loadInvitations}>
            Try again
          </button>
        </div>
      )}

      {!error && loading && (
        <p className="admin-invitations__message">
          Loading invitations...
        </p>
      )}

      {!error && !loading && (
        <div className="admin-invitations__table-wrapper">
          <table className="admin-invitations__table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Created</th>
                <th>Action</th>
                <th>Open Invitation</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvitations.map((invitation) => (
                <tr key={invitation.id}>
                  <td>{invitation.email}</td>

                  <td>
                    {roles.find((role) => role.id === invitation.roleId)
                      ?.name || invitation.roleId}
                  </td>

                  <td>
                    <span
                      className={
                        "invitation-status invitation-status--" +
                        (invitation.status || "unknown").toLowerCase()
                      }
                    >
                      {invitation.status}
                    </span>
                  </td>

                  <td>
                    {invitation.expiresAt
                      ? new Date(invitation.expiresAt).toLocaleString()
                      : "—"}
                  </td>

                  <td>
                    {invitation.createdAt
                      ? new Date(invitation.createdAt).toLocaleString()
                      : "—"}
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => handleVerifyInvitation(invitation)}
                      disabled={verifyingId === invitation.id}
                    >
                      {verifyingId === invitation.id
                        ? "Verifying..."
                        : "Verify invitation"}
                    </button>

                    {invitation.token && (
                      <button
                        type="button"
                        onClick={() =>
                          copyText(getInvitationLink(invitation.token))
                        }
                      >
                        Copy link
                      </button>
                    )}
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => handleOpenInvitation(invitation)}
                      disabled={openingId === invitation.id}
                    >
                      {openingId === invitation.id
                        ? "Opening..."
                        : "Open Invitation"}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredInvitations.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-state">
                    {invitations.length === 0
                      ? "No invitations found."
                      : "No invitations match your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default AdminInvitations;
