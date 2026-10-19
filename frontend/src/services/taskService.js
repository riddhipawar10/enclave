
import api from "./api";

// Get tasks for one project.
// Existing Manager Tasks functionality.
export const getTasks = async (organizationId, projectId) => {
  const response = await api.get(
    `/organizations/${organizationId}/projects/${projectId}/tasks`
  );

  return response.data;
};

// Get every task belonging to one organization.
// Used by the Admin Tasks page.
export const getOrganizationTasks = async (organizationId) => {
  const response = await api.get(
    `/organizations/${organizationId}/tasks`
  );

  return response.data;
};

// Create a task.
export const createTask = async (
  organizationId,
  projectId,
  taskData
) => {
  const response = await api.post(
    `/organizations/${organizationId}/projects/${projectId}/tasks`,
    taskData
  );

  return response.data;
};

// Update a task.
export const updateTask = async (
  organizationId,
  projectId,
  taskId,
  taskData
) => {
  const response = await api.put(
    `/organizations/${organizationId}/projects/${projectId}/tasks/${taskId}`,
    taskData
  );

  return response.data;
};

// Mark a task as completed.
export const markTaskAsCompleted = async (
  organizationId,
  projectId,
  task
) => {
  const response = await api.put(
    `/organizations/${organizationId}/projects/${projectId}/tasks/${task.id}`,
    {
      title: task.title,
      description: task.description,
      statusId: "ceceaeed-5a8f-494f-9005-8c7330eb4e35",
      priorityId: task.priorityId,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
      position: task.position ?? 0,
      sprintId: task.sprintId ?? null,
    }
  );

  return response.data;
};

// Delete a task.
export const deleteTask = async (
  organizationId,
  projectId,
  taskId
) => {
  await api.delete(
    `/organizations/${organizationId}/projects/${projectId}/tasks/${taskId}`
  );
};

export default {
  getTasks,
  getOrganizationTasks,
  createTask,
  updateTask,
  markTaskAsCompleted,
  deleteTask,
};
