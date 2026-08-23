/*import React from "react";*/
import OrganizationCard from "./OrganizationCard";
import ErrorMessage from "../common/ErrorMessage";
import LoadingSpinner from "../common/LoadingSpinner";
import "./OrganizationList.css";

function OrganizationList({
  organizations = [],
  isLoading = false,
  error = "",
  onViewDetails,
  emptyMessage = "No organizations found.",
}) {
  if (isLoading) {
    return <LoadingSpinner message="Loading organizations..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!organizations || organizations.length === 0) {
    return <p className="organization-list-status">{emptyMessage}</p>;
  }

  return (
    <div className="organization-list">
      {organizations.map((org) => (
        <OrganizationCard key={org.id} organization={org} onViewDetails={onViewDetails} />
      ))}
    </div>
  );
}

export default OrganizationList;