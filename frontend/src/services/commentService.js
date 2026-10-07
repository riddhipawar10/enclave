import api from "./api";

export const getComments = async (taskId) => {
  const response = await api.get(
    `/tasks/${taskId}/comments`
  );

  return response.data;
};

export const createComment = async (
  taskId,
  userId,
  content
) => {
  const response = await api.post(
    `/tasks/${taskId}/comments`,
    {
      userId,
      content,
    }
  );

  return response.data;
};

export const deleteComment = async (
  taskId,
  commentId,
  userId
) => {
  await api.delete(
    `/tasks/${taskId}/comments/${commentId}`,
    {
      params: {
        userId,
      },
    }
  );
};

export default {
  getComments,
  createComment,
  deleteComment,
};