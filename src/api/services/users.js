// Contract §4.2

import { client } from "../client";

export const updateMe = (body) => client.put("/users/me", body);

export const changePassword = (body) => client.put("/users/me/password", body);
