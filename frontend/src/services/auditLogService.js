
import api from "./api";

// Fetch audit logs for a selected organization.
export const getOrganizationAuditLogs = async (organizationId) => {
  const response = await api.get(
    `/organizations/${organizationId}/audit-logs`
  );

  return response.data;
};

export default {
  getOrganizationAuditLogs,
};
