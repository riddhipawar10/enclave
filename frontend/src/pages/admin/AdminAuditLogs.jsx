
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  getAllOrganizationsForPlatformAdmin,
} from "../../services/organizationService";

import {
  getOrganizationAuditLogs,
} from "../../services/auditLogService";

import "./AdminAuditLogs.css";

function AdminAuditLogs() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState(searchParams.get("organizationId") || "");

  const [logs, setLogs] = useState([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] =
    useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const [error, setError] = useState("");

  // Load organizations available to the platform admin.
  useEffect(() => {
    let isMounted = true;

    async function loadOrganizations() {
      try {
        setError("");

        const data = await getAllOrganizationsForPlatformAdmin();
        const organizationList = Array.isArray(data) ? data : [];

        if (!isMounted) return;

        setOrganizations(organizationList);

        const requestedId = searchParams.get("organizationId");

        const matchingOrganization = organizationList.find(
          (organization) =>
            String(
              organization.id ?? organization.organizationId
            ) === requestedId
        );

        const selectedOrganization =
          matchingOrganization ?? organizationList[0];

        const organizationId =
          selectedOrganization?.id ??
          selectedOrganization?.organizationId;

        setSelectedOrganizationId(
          organizationId ? String(organizationId) : ""
        );
      } catch (err) {
        if (isMounted) {
          setError(
            err?.response?.status === 403
              ? "You don't have permission to view organizations."
              : "Failed to load organizations. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingOrganizations(false);
        }
      }
    }

    loadOrganizations();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // Keep the selected organization in the URL.
  useEffect(() => {
    const currentId = searchParams.get("organizationId") || "";

    if (currentId === selectedOrganizationId) return;

    const nextParams = new URLSearchParams(searchParams);

    if (selectedOrganizationId) {
      nextParams.set("organizationId", selectedOrganizationId);
    } else {
      nextParams.delete("organizationId");
    }

    setSearchParams(nextParams, { replace: true });
  }, [
    selectedOrganizationId,
    searchParams,
    setSearchParams,
  ]);

  // Fetch audit logs for the selected organization.
  useEffect(() => {
    let isMounted = true;

    async function loadAuditLogs() {
      if (!selectedOrganizationId) {
        setLogs([]);
        setIsLoadingLogs(false);
        return;
      }

      try {
        setIsLoadingLogs(true);
        setError("");

        const data = await getOrganizationAuditLogs(
          selectedOrganizationId
        );

        if (!isMounted) return;

        // Support a direct array or a common paginated response.
        const logList = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data?.logs)
              ? data.logs
              : [];

        setLogs(logList);
      } catch (err) {
        if (isMounted) {
          setLogs([]);

          setError(
            err?.response?.status === 403
              ? "You don't have permission to view audit logs for this organization."
              : err?.response?.status === 404
                ? "The audit logs endpoint was not found. Please check the backend route."
                : "Failed to load audit logs. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingLogs(false);
        }
      }
    }

    loadAuditLogs();

    return () => {
      isMounted = false;
    };
  }, [selectedOrganizationId]);

  const handleOrganizationChange = (event) => {
    setSelectedOrganizationId(event.target.value);
  };

  const selectedOrganization = organizations.find(
    (organization) =>
      String(
        organization.id ?? organization.organizationId
      ) === selectedOrganizationId
  );

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString();
  };

  const formatDetails = (details) => {
    if (details == null) return "—";

    if (typeof details === "string") {
      try {
        return JSON.stringify(JSON.parse(details), null, 2);
      } catch {
        return details;
      }
    }

    try {
      return JSON.stringify(details, null, 2);
    } catch {
      return String(details);
    }
  };

  const getLogId = (log, index) =>
    log.id ?? `${log.action}-${log.createdAt}-${index}`;

  return (
    <div className="admin-audit-logs">
      <header className="admin-audit-logs__header">
        <div>
          <p className="admin-audit-logs__eyebrow">
            ADMINISTRATION
          </p>

          <h2>Audit Logs</h2>

          <p>
            Review recorded activities for your selected organization.
          </p>
        </div>
      </header>

      {error && (
        <div
          className="admin-audit-logs__message admin-audit-logs__message--error"
          role="alert"
        >
          {error}
        </div>
      )}

      <section className="admin-audit-logs__filters">
        <label htmlFor="audit-log-organization">
          Select organization
        </label>

        {isLoadingOrganizations ? (
          <p>Loading organizations...</p>
        ) : organizations.length === 0 ? (
          <p>No organizations are available.</p>
        ) : (
          <select
            id="audit-log-organization"
            value={selectedOrganizationId}
            onChange={handleOrganizationChange}
          >
            {organizations.map((organization) => {
              const organizationId =
                organization.id ?? organization.organizationId;

              return (
                <option
                  key={organizationId}
                  value={String(organizationId)}
                >
                  {organization.name ??
                    organization.organizationName ??
                    "Unnamed organization"}
                </option>
              );
            })}
          </select>
        )}

        {selectedOrganization && (
          <p className="admin-audit-logs__organization">
            Showing activity for{" "}
            <strong>
              {selectedOrganization.name ??
                selectedOrganization.organizationName ??
                "Selected organization"}
            </strong>
          </p>
        )}
      </section>

      <section className="admin-audit-logs__content">
        <div className="admin-audit-logs__table-header">
          <div>
            <h3>Activity history</h3>
            <p>Most recent recorded activities appear first.</p>
          </div>

          <span className="admin-audit-logs__count">
            {logs.length} record(s)
          </span>
        </div>

        {isLoadingOrganizations ? (
          <div className="admin-audit-logs__empty">
            Loading organizations...
          </div>
        ) : isLoadingLogs ? (
          <div className="admin-audit-logs__empty">
            Loading audit logs...
          </div>
        ) : error ? (
          <div className="admin-audit-logs__empty">
            Audit logs could not be loaded.
          </div>
        ) : !selectedOrganizationId ? (
          <div className="admin-audit-logs__empty">
            Select an organization to view its audit logs.
          </div>
        ) : logs.length === 0 ? (
          <div className="admin-audit-logs__empty">
            No audit log records were found for this organization.
          </div>
        ) : (
          <div className="admin-audit-logs__table-wrapper">
            <table className="admin-audit-logs__table">
              <thead>
                <tr>
                  <th>Date and time</th>
                  <th>Action</th>
                  <th>Entity type</th>
                  <th>Entity ID</th>
                  <th>User ID</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log, index) => (
                  <tr key={getLogId(log, index)}>
                    <td>{formatDate(log.createdAt)}</td>

                    <td>
                      <span className="admin-audit-logs__action">
                        {log.action || "—"}
                      </span>
                    </td>

                    <td>{log.entityType || "—"}</td>

                    <td className="admin-audit-logs__id">
                      {log.entityId || "—"}
                    </td>

                    <td className="admin-audit-logs__id">
                      {log.actorId || log.userId || "—"}
                    </td>

                    <td>
                      <pre className="admin-audit-logs__details">
                        {formatDetails(log.details)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminAuditLogs;
