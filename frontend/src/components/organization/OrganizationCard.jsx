import "./OrganizationCard.css";

function OrganizationCard({ organization, onViewDetails }) {
  if (!organization) {
    return null;
  }

  const {
    id,
    name,
    slug,
    isActive,
    createdAt,
    roleName,
  } = organization;

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

      {roleName && (
        <p className="organization-card-role">
          Role: <strong>{roleName}</strong>
        </p>
      )}

      {formattedDate && (
        <p className="organization-card-date">
          Created on {formattedDate}
        </p>
      )}

      {onViewDetails && (
        <button
          type="button"
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