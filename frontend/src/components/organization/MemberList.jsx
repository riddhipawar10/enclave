/*import React from "react";*/
import ErrorMessage from "../common/ErrorMessage";
import LoadingSpinner from "../common/LoadingSpinner";
import "./MemberList.css";

function MemberList({
  members = [],
  isLoading = false,
  error = "",
  onRemove,
  emptyMessage = "No members yet.",
}) {
  if (isLoading) {
    return <LoadingSpinner message="Loading members..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!members || members.length === 0) {
    return <p className="member-list-status">{emptyMessage}</p>;
  }

  return (
    <table className="member-list">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Joined</th>
          <th>Status</th>
          {onRemove && <th></th>}
        </tr>
      </thead>
      <tbody>
        {members.map((member) => (
          <tr key={member.id}>
            <td>
              {member.firstName} {member.lastName}
            </td>
            <td>{member.email}</td>
            <td>
              <span className="member-role-badge">{member.roleName}</span>
            </td>
            <td>
              {member.joinedAt
                ? new Date(member.joinedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "-"}
            </td>
            <td>
              <span
                className={
                  member.isActive
                    ? "member-status active"
                    : "member-status inactive"
                }
              >
                {member.isActive ? "Active" : "Inactive"}
              </span>
            </td>
            {onRemove && (
              <td>
                <button
                  className="member-remove-button"
                  onClick={() => onRemove(member.userId)}
                >
                  Remove
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default MemberList;