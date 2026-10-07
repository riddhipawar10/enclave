import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import MemberList from "../../components/organization/MemberList";
import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import {
  getOrganizationById,
  getOrganizationMembers,
} from "../../services/organizationService";

import "./OrganizationDetails.css";

function OrganizationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);

  const [error, setError] = useState("");
  const [membersError, setMembersError] = useState("");

  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setError("");

        const data = await getOrganizationById(id);
        setOrganization(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError("Failed to load organization details.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMembers = async () => {
      try {
        setMembersError("");

        const data = await getOrganizationMembers(id);
        setMembers(data || []);
      } catch (err) {
        console.error("Failed to load members:", err);
        setMembersError("Failed to load members.");
      } finally {
        setMembersLoading(false);
      }
    };

    if (id) {
      fetchOrganization();
      fetchMembers();
    }
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner message="Loading organization..." />;
  }

  if (notFound) {
    return (
      <div className="organization-details-page">
        <p>Organization not found.</p>

        <button
          type="button"
          className="organization-details-back-button"
          onClick={() => navigate("/organizations")}
        >
          &larr; Back to Dashboard
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="organization-details-page">
        <ErrorMessage message={error} />

        <button
          type="button"
          className="organization-details-back-button"
          onClick={() => navigate("/organizations")}
        >
          &larr; Back to Dashboard
        </button>
      </div>
    );
  }

  const currentUserMembership = members.find(
    (member) => member.userId === user?.id
  );

  const isAdmin =
    currentUserMembership?.roleName === "ADMIN";

  return (
    <div className="organization-details-page">

      {/* Back Button */}

      <button
        type="button"
        className="organization-details-back-button"
        onClick={() => navigate("/organizations")}
      >
        &larr; Back to Dashboard
      </button>

      {/* Organization Header */}

      <div className="organization-details-header">

        <div className="organization-details-header-info">

          <h2>{organization.name}</h2>

          <p className="organization-details-slug">
            @{organization.slug}
          </p>

          <span
            className={
              organization.isActive
                ? "organization-status active"
                : "organization-status inactive"
            }
          >
            {organization.isActive
              ? "Active"
              : "Inactive"}
          </span>

        </div>

        <div className="organization-details-actions">

          {isAdmin && (
            <button
              type="button"
              className="organization-details-edit-button"
              onClick={() =>
                navigate(`/organizations/${id}/edit`)
              }
            >
              Edit
            </button>
          )}

          <button
            type="button"
            className="organization-details-manage-button"
            onClick={() =>
              navigate(`/team?organizationId=${id}`)
            }
          >
            Manage Members
          </button>

        </div>

      </div>

      {/* Members */}

      <h3 className="organization-details-members-title">
        Members
      </h3>

      <MemberList
        members={members}
        isLoading={membersLoading}
        error={membersError}
      />

    </div>
  );
}

export default OrganizationDetails;