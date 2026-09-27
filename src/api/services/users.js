import { client } from "../client";

/** Contract §4.2 */

/** PUT /users/me {fullName, phone?, bio?, avatarUrl?} → UserResponse */
export const updateMe = (body) => client.put("/users/me", body);

/** PUT /users/me/password {currentPassword, newPassword} → 204 */
export const changePassword = (body) => client.put("/users/me/password", body);
