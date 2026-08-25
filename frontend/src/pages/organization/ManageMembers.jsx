import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MemberList from "../../components/organization/MemberList";
import InviteMemberForm from "../../components/organization/InviteMemberForm";
import ErrorMessage from "../../components/common/ErrorMessage";
import {
  getOrganizationMembers,
  removeMember,
} from "../../services/organizationService";
import "./ManageMembers.css";

function ManageMembers() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const data = await getOrganizationMembers(id);
      setMembers(data);
    } catch {
      setLoadError("Failed to load members.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const data = await getOrganizationMembers(id);

        if (!isCancelled) {
          setMembers(data);
        }
      } catch {
        if (!isCancelled) {
          setLoadError("Failed to load members.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchMembers();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  const handleMemberAdded = () => {
    setSuccessMessage("Member added.");
    loadMembers();
  };

  const handleRemove = async (userId) => {
    try {
      setActionError("");
      setSuccessMessage("");

      await removeMember(id, userId);

      setSuccessMessage("Member removed.");
      loadMembers();
    } catch {
      setActionError("Failed to remove member. Please try again.");
    }
  };

  return (
    <div className="manage-members-page">
      <button
        className="manage-members-back-button"
        onClick={() => navigate(`/organizations/${id}`)}
      >
        &larr; Back to Organization
      </button>

      <h2>Manage Members</h2>

      {successMessage && (
        <p className="manage-members-success">{successMessage}</p>
      )}

      <ErrorMessage message={actionError} />

      <InviteMemberForm
        organizationId={id}
        onMemberAdded={handleMemberAdded}
      />

      <MemberList
        members={members}
        isLoading={isLoading}
        error={loadError}
        onRemove={handleRemove}
      />
    </div>
  );
}

export default ManageMembers;