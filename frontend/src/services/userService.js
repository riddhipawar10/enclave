import api from "./api";

/**
 * Get the currently authenticated user.
 *
 * Backend:
 * GET /api/users/me
 */
export async function getCurrentUser() {
  const response = await api.get("/users/me");

  return response.data;
}

/**
 * Update the currently authenticated user's profile.
 *
 * Backend:
 * PUT /api/users/me
 */
export async function updateCurrentUser(
  profileData
) {
  const response = await api.put(
    "/users/me",
    profileData
  );

  return response.data;
}

/**
 * Change the currently authenticated user's
 * password.
 *
 * Backend:
 * PUT /api/users/me/password
 */
export async function changePassword(
  currentPassword,
  newPassword
) {
  await api.put(
    "/users/me/password",
    {
      currentPassword,
      newPassword,
    }
  );
}

const userService = {
  getCurrentUser,
  updateCurrentUser,
  changePassword,
};

export default userService;