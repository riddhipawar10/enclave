
import { useEffect, useMemo, useState } from "react";
import {
  getAllMembersForPlatformAdmin,
} from "../../services/organizationService";
import "./AdminMembers.css";

function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadMembers = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAllMembersForPlatformAdmin();

        if (!cancelled) {
          setMembers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load organization members. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMembers();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return members;
    }

    return members.filter((member) => {
      const searchableValues = [
        member.firstName,
        member.lastName,
        member.email,
        member.organizationName,
        member.organizationId,
        member.roleName,
      ];

      return searchableValues.some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );
    });
  }, [members, search]);

  const getMemberName = (member) => {
    const name = [
      member.firstName,
      member.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return name || "Unnamed member";
  };

  return (
    <main className="admin-members-page">
      <header className="admin-members-header">
        <div>
          <p className="admin-members-eyebrow">
            PLATFORM ADMINISTRATION
          </p>

          <h1>Members</h1>

          <p className="admin-members-subtitle">
            View members across all Enclave organizations.
          </p>
        </div>

        <div className="admin-members-total">
          <span>Total memberships</span>
          <strong>{members.length}</strong>
        </div>
      </header>

      <section className="admin-members-panel">
        <div className="admin-members-toolbar">
          <div>
            <h2>Organization members</h2>
            <p>
              Search by name, email, organization, or role.
            </p>
          </div>

          <input
            type="search"
            className="admin-members-search"
            placeholder="Search members..."
            aria-label="Search members"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading && (
          <div className="admin-members-message">
            Loading organization members...
          </div>
        )}

        {!loading && error && (
          <div className="admin-members-error" role="alert">
            {error}
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="admin-members-results">
              Showing {filteredMembers.length} of {members.length} memberships
            </div>

            {filteredMembers.length === 0 ? (
              <div className="admin-members-message">
                {members.length === 0
                  ? "No organization memberships were found."
                  : "No members match your search."}
              </div>
            ) : (
              <div className="admin-members-table-wrapper">
                <table className="admin-members-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Email</th>
                      <th>Organization</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMembers.map((member, index) => {
                      const key =
                        member.id ??
                        `${member.organizationId ?? "org"}-${member.userId ?? index}`;

                      const organization =
                        member.organizationName ||
                        member.organizationId ||
                        "—";

                      const role = member.roleName || "—";

                      const active =
                        member.isActive ?? member.active;

                      return (
                        <tr key={key}>
                          <td>
                            <div className="admin-members-person">
                              <span className="admin-members-avatar">
                                {getMemberName(member)
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>

                              <span>{getMemberName(member)}</span>
                            </div>
                          </td>

                          <td>{member.email || "—"}</td>
                          <td>{organization}</td>
                          <td>
                            <span className="admin-members-role">
                              {role}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`admin-members-status ${
                                active === false
                                  ? "is-inactive"
                                  : "is-active"
                              }`}
                            >
                              {active === false ? "Inactive" : "Active"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default AdminMembers;
