/*import React from "react";*/
import "./OrganizationCard.css";

/**
 * OrganizationCard
 *
 * Displays basic information about a single organization in a card format.
 * This component is purely presentational - it does not fetch any data itself.
 * The parent component (e.g. OrganizationList or OrganizationDashboard) is
 * responsible for fetching organization data and passing it in as props.
 *
 * Fields shown match the real `organizations` table exactly:
 *   id, name, slug, isActive, createdAt (updatedAt is intentionally not
 *   shown here - a card is meant to be compact; it's more relevant on a
 *   details page).
 *
 * Props:
 * - organization (object) : the organization data to display
 *     - id        (string) : unique identifier
 *     - name      (string) : organization name
 *     - slug      (string) : unique url-friendly identifier
 *     - isActive  (boolean): whether the organization is active
 *     - createdAt (string) : ISO date string of when it was created
 * - onViewDetails (function, optional): called with organization.id when
 *     the "View Details" button is clicked. If not provided, the button
 *     is not rendered.
 */
function OrganizationCard({ organization, onViewDetails }) {
  // Guard clause: if no organization data is passed, render nothing.
  if (!organization) {
    return null;
  }

  const { id, name, slug, isActive, createdAt } = organization;

  // Format the createdAt date into a readable string (e.g. "12 Aug 2025").
  // If createdAt is missing or invalid, we simply skip showing it.
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(id);
    }
  };

  return (
    <div className="organization-card">
      <div className="organization-card-header">
        <h3 className="organization-card-name">{name}</h3>
        <span
          className={
            isActive
              ? "organization-status active"
              : "organization-status inactive"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <p className="organization-card-slug">@{slug}</p>

      {formattedDate && (
        <p className="organization-card-date">Created on {formattedDate}</p>
      )}

      {onViewDetails && (
        <button
          className="organization-card-button"
          onClick={handleViewDetails}
        >
          View Details
        </button>
      )}
    </div>
  );
}

export default OrganizationCard;